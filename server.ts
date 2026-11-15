import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { INITIAL_FARMERS, INITIAL_INSURANCE_RECORDS } from './src/data/seedData';
import { Farmer, CropInsuranceRecord } from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory backend database store initialized with seed records
let farmersDb: Farmer[] = [...INITIAL_FARMERS];
let insuranceDb: CropInsuranceRecord[] = [...INITIAL_INSURANCE_RECORDS];

// Middleware: Enforce coordinator authorization on backend
function requireVillageCoordinatorAuth(req: Request, res: Response, next: NextFunction) {
  const userRole = (req.headers['x-user-role'] as string) || '';
  const authHeader = (req.headers['authorization'] as string) || '';
  const coordinatorBadge = (req.headers['x-coordinator-badge'] as string) || '';

  // Valid if role is 'Village Agriculture Coordinator' or carries coordinator badge/token
  const isAuthorized = 
    userRole === 'Village Agriculture Coordinator' ||
    coordinatorBadge.startsWith('AP-AGR-') ||
    authHeader.includes('Village Agriculture Coordinator') ||
    authHeader.includes('AP-AGR-');

  if (!isAuthorized) {
    return res.status(403).json({
      error: 'Access Denied: Only authenticated Village Agriculture Coordinators are authorized to update farmer records.',
      requiredRole: 'Village Agriculture Coordinator',
      receivedRole: userRole || 'Unauthenticated/Guest'
    });
  }

  next();
}

async function startServer() {
  const app = express();
  const portArgIndex = process.argv.indexOf('--port');
  const portArg = portArgIndex !== -1 ? Number(process.argv[portArgIndex + 1]) : null;
  const PORT = portArg || (process.env.NODE_ENV === 'production' && process.env.PORT ? Number(process.env.PORT) : 3000);

  app.use(express.json({ limit: '10mb' }));

  // ---------------- API ROUTES ----------------

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      service: 'FWMS Backend API',
      timestamp: new Date().toISOString()
    });
  });

  // Current session & auth status
  app.get('/api/auth/me', (req: Request, res: Response) => {
    const userRole = (req.headers['x-user-role'] as string) || 'Village Agriculture Coordinator';
    res.json({
      authenticated: true,
      role: userRole,
      badgeId: (req.headers['x-coordinator-badge'] as string) || 'AP-AGR-2024-8841',
      jurisdiction: 'Kankipadu Agricultural Sub-Division'
    });
  });

  // Get all farmers
  app.get('/api/farmers', (req: Request, res: Response) => {
    res.json(farmersDb);
  });

  // Get single farmer by ID
  app.get('/api/farmers/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const farmer = farmersDb.find(f => f.id === id);
    if (!farmer) {
      return res.status(404).json({ error: `Farmer with ID ${id} not found.` });
    }
    res.json(farmer);
  });

  // Update farmer by ID (Requires authenticated Village Agriculture Coordinator)
  app.put('/api/farmers/:id', requireVillageCoordinatorAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const existingIndex = farmersDb.findIndex(f => f.id === id);

    if (existingIndex === -1) {
      return res.status(404).json({ error: `Farmer with ID ${id} not found.` });
    }

    const existingFarmer = farmersDb[existingIndex];
    const updates: Partial<Farmer> = req.body;

    // Field-level validations
    if (updates.fullName !== undefined && !updates.fullName.trim()) {
      return res.status(400).json({ error: 'Full Name cannot be empty.' });
    }

    if (updates.fatherSpouseName !== undefined && !updates.fatherSpouseName.trim()) {
      return res.status(400).json({ error: 'Father/Spouse Name cannot be empty.' });
    }

    if (updates.age !== undefined && (updates.age < 18 || updates.age > 100)) {
      return res.status(400).json({ error: 'Age must be between 18 and 100.' });
    }

    if (updates.phone !== undefined && (!updates.phone.trim() || updates.phone.trim().length < 10)) {
      return res.status(400).json({ error: 'Valid phone number with at least 10 digits is required.' });
    }

    if (updates.landAreaAcres !== undefined && updates.landAreaAcres <= 0) {
      return res.status(400).json({ error: 'Land area must be greater than 0 acres.' });
    }

    if (updates.status !== undefined && updates.status !== 'Active' && updates.status !== 'Inactive') {
      return res.status(400).json({ error: 'Status must be either "Active" or "Inactive".' });
    }

    if (updates.primaryCrop !== undefined && !updates.primaryCrop.trim()) {
      return res.status(400).json({ error: 'Primary Crop cannot be empty.' });
    }

    if (updates.village !== undefined && !updates.village.trim()) {
      return res.status(400).json({ error: 'Village cannot be empty.' });
    }

    // Maintain update timestamps and preserve immutable identifiers / registration date
    const updatedFarmer: Farmer = {
      ...existingFarmer,
      ...updates,
      id: existingFarmer.id, // Immutable ID
      registrationDate: existingFarmer.registrationDate, // Immutable original registration date
      updatedAt: new Date().toISOString() // Maintained update timestamp
    };

    farmersDb[existingIndex] = updatedFarmer;

    res.json({
      success: true,
      message: `Farmer record for ${updatedFarmer.fullName} (${updatedFarmer.id}) successfully updated.`,
      farmer: updatedFarmer
    });
  });

  // Toggle farmer status between Active and Inactive (Requires authenticated Village Agriculture Coordinator)
  app.patch('/api/farmers/:id/status', requireVillageCoordinatorAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    if (status !== 'Active' && status !== 'Inactive') {
      return res.status(400).json({ error: 'Status must be either "Active" or "Inactive".' });
    }

    const existingIndex = farmersDb.findIndex(f => f.id === id);
    if (existingIndex === -1) {
      return res.status(404).json({ error: `Farmer with ID ${id} not found.` });
    }

    const existing = farmersDb[existingIndex];
    const updatedFarmer: Farmer = {
      ...existing,
      status,
      updatedAt: new Date().toISOString()
    };

    farmersDb[existingIndex] = updatedFarmer;

    res.json({
      success: true,
      message: `Farmer ${existing.fullName} status updated to ${status}. Historical survey, emergency, and welfare records remain preserved.`,
      farmer: updatedFarmer
    });
  });

  // Register new farmer (Requires authenticated Village Agriculture Coordinator)
  app.post('/api/farmers', requireVillageCoordinatorAuth, (req: Request, res: Response) => {
    const data = req.body;

    if (!data.fullName?.trim() || !data.fatherSpouseName?.trim() || !data.phone?.trim()) {
      return res.status(400).json({ error: 'Full name, father/spouse name, and phone are required.' });
    }

    const newFarmer: Farmer = {
      id: data.id || `FMR-AP-0${Math.floor(100 + Math.random() * 900)}`,
      fullName: data.fullName.trim(),
      fatherSpouseName: data.fatherSpouseName.trim(),
      age: Number(data.age) || 45,
      gender: data.gender || 'Male',
      phone: data.phone.trim(),
      aadhaarMasked: data.aadhaarMasked || 'XXXX-XXXX-0000',
      village: data.village || 'Kankipadu',
      mandal: data.mandal || `${data.village || 'Kankipadu'} Mandal`,
      district: data.district || 'Krishna District',
      state: data.state || 'Andhra Pradesh',
      landAreaAcres: Number(data.landAreaAcres) || 1.0,
      soilType: data.soilType || 'Alluvial Clay Loam',
      waterSource: data.waterSource || 'Canal Irrigation',
      primaryCrop: data.primaryCrop || 'Paddy',
      cropVariety: data.cropVariety || 'Standard Variety',
      registrationDate: new Date().toISOString().slice(0, 10),
      status: data.status || 'Active',
      notes: data.notes || '',
      updatedAt: new Date().toISOString()
    };

    farmersDb.unshift(newFarmer);

    res.status(201).json({
      success: true,
      message: `Farmer ${newFarmer.fullName} registered successfully.`,
      farmer: newFarmer
    });
  });

  // Permanent deletion strictly prohibited - Enforce backend policy
  app.delete('/api/farmers/:id', (req: Request, res: Response) => {
    res.status(403).json({
      error: 'Permanent deletion of farmer records is strictly prohibited.',
      reason: 'Farmer survey, crop-health, emergency, and welfare scheme history must be preserved for government audit compliance.',
      recommendedAction: 'To stop a farmer from active use, update their status to "Inactive" instead of deleting.',
      allowedAction: 'UPDATE_STATUS_TO_INACTIVE'
    });
  });

  // ---------------- CROP INSURANCE ROUTES ----------------
  // Get all insurance records
  app.get('/api/insurance', (req: Request, res: Response) => {
    res.json(insuranceDb);
  });

  // Get single insurance record
  app.get('/api/insurance/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const found = insuranceDb.find(r => r.id === id);
    if (!found) {
      return res.status(404).json({ error: `Insurance record ${id} not found.` });
    }
    res.json(found);
  });

  // Register new crop insurance record (Requires coordinator auth)
  app.post('/api/insurance', requireVillageCoordinatorAuth, (req: Request, res: Response) => {
    const data = req.body;
    if (!data.farmerId || !data.farmerName || !data.insuranceScheme) {
      return res.status(400).json({ error: 'Farmer ID, Farmer Name, and Insurance Scheme are required.' });
    }

    const nowIso = new Date().toISOString();
    const todayStr = nowIso.slice(0, 10);

    const initialHistory = Array.isArray(data.claimHistory) && data.claimHistory.length > 0
      ? data.claimHistory
      : [
          {
            id: `HIST-${Date.now()}-1`,
            date: todayStr,
            action: data.claimStatus && data.claimStatus !== 'Not Reported' ? `Crop Damage Logged (${data.claimStatus})` : 'Insurance Policy Enrolled',
            status: data.claimStatus || 'Not Reported',
            notes: data.coordinatorRemarks || 'Initial registration recorded in village registry.',
            amount: data.approvedClaimAmount !== undefined ? Number(data.approvedClaimAmount) : undefined,
            updatedBy: 'Village Agriculture Coordinator'
          }
        ];

    const newRecord: CropInsuranceRecord = {
      id: data.id || `INS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      farmerId: data.farmerId,
      farmerName: data.farmerName,
      village: data.village || 'Kankipadu',
      crop: data.crop || 'Paddy',
      season: data.season || 'Kharif',
      insuranceScheme: data.insuranceScheme || 'PMFBY (Pradhan Mantri Fasal Bima Yojana)',
      insuredLandAreaAcres: Number(data.insuredLandAreaAcres) || 1.0,
      premiumStatus: data.premiumStatus || 'Subsidized',
      damageType: data.damageType || undefined,
      damageDate: data.damageDate || undefined,
      damageDescription: data.damageDescription || undefined,
      supportingImageUrl: data.supportingImageUrl || undefined,
      claimApplicationDate: data.claimApplicationDate || undefined,
      claimStatus: data.claimStatus || 'Not Reported',
      approvedClaimAmount: data.approvedClaimAmount !== undefined ? Number(data.approvedClaimAmount) : undefined,
      paymentStatus: data.paymentStatus || 'Unpaid',
      coordinatorRemarks: data.coordinatorRemarks || 'Registered by Village Agriculture Coordinator',
      claimHistory: initialHistory,
      createdAt: data.createdAt || nowIso,
      updatedAt: nowIso
    };

    insuranceDb.unshift(newRecord);

    res.status(201).json({
      success: true,
      message: `Crop insurance record for ${newRecord.farmerName} (${newRecord.id}) registered.`,
      insurance: newRecord
    });
  });

  // Update crop insurance / claim record (Requires coordinator auth)
  app.put('/api/insurance/:id', requireVillageCoordinatorAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const existingIndex = insuranceDb.findIndex(r => r.id === id);
    if (existingIndex === -1) {
      return res.status(404).json({ error: `Insurance record ${id} not found.` });
    }

    const existing = insuranceDb[existingIndex];
    const updates = req.body;
    const nowIso = new Date().toISOString();
    const todayStr = nowIso.slice(0, 10);

    const statusChanged = updates.claimStatus && updates.claimStatus !== existing.claimStatus;
    const amountChanged = updates.approvedClaimAmount !== undefined && updates.approvedClaimAmount !== existing.approvedClaimAmount;
    const paymentChanged = updates.paymentStatus && updates.paymentStatus !== existing.paymentStatus;

    let actionLabel = 'Record Updated';
    if (statusChanged) {
      actionLabel = `Claim Status: ${updates.claimStatus}`;
    } else if (amountChanged) {
      actionLabel = `Relief Amount Recorded (₹${Number(updates.approvedClaimAmount).toLocaleString('en-IN')})`;
    } else if (paymentChanged) {
      actionLabel = `Payment Status: ${updates.paymentStatus}`;
    }

    const historyItem = {
      id: `HIST-${Date.now()}`,
      date: todayStr,
      action: actionLabel,
      status: updates.claimStatus || existing.claimStatus,
      notes: updates.coordinatorRemarks || updates.damageDescription || 'Status updated by coordinator.',
      amount: updates.approvedClaimAmount !== undefined ? Number(updates.approvedClaimAmount) : existing.approvedClaimAmount,
      updatedBy: 'Village Agriculture Coordinator'
    };

    const existingHistory = Array.isArray(existing.claimHistory) ? existing.claimHistory : [];
    const updatedHistory = updates.claimHistory || [...existingHistory, historyItem];

    const updated: CropInsuranceRecord = {
      ...existing,
      ...updates,
      claimHistory: updatedHistory,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: nowIso
    };

    insuranceDb[existingIndex] = updated;

    res.json({
      success: true,
      message: `Crop insurance claim status updated to "${updated.claimStatus}".`,
      insurance: updated
    });
  });

  // ---------------- VITE / STATIC HOSTING ----------------
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FWMS Application running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
