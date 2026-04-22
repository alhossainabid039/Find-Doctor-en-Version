import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs/promises";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock Database Path
  const DB_PATH = path.join(process.cwd(), "db.json");

  // Initial DB load
  async function getDb() {
    try {
      const data = await fs.readFile(DB_PATH, "utf-8");
      return JSON.parse(data);
    } catch {
      const initialDb = {
        doctors: [
          {
            id: "1",
            name: "Dr. Sarah Chen",
            specialization: "General Physician",
            experience: 12,
            hospital: "City Central Hospital",
            location: "Downtown",
            fee: 50,
            rating: 4.8,
            image: "https://images.unsplash.com/photo-1559839734-2b71f153673f?q=80&w=256&h=256&auto=format&fit=crop",
            slots: ["09:00 AM", "10:30 AM", "02:00 PM", "04:30 PM"]
          },
          {
            id: "2",
            name: "Dr. James Wilson",
            specialization: "Cardiologist",
            experience: 15,
            hospital: "Heart & Vascular Institute",
            location: "North Side",
            fee: 120,
            rating: 4.9,
            image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=256&h=256&auto=format&fit=crop",
            slots: ["11:00 AM", "01:00 PM", "03:30 PM"]
          },
          {
            id: "3",
            name: "Dr. Elena Rodriguez",
            specialization: "Neurologist",
            experience: 10,
            hospital: "NeuroCare Clinic",
            location: "West End",
            fee: 100,
            rating: 4.7,
            image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=256&h=256&auto=format&fit=crop",
            slots: ["09:30 AM", "12:00 PM", "02:30 PM"]
          },
          {
            id: "4",
            name: "Dr. Michael Lee",
            specialization: "Dermatologist",
            experience: 8,
            hospital: "Skin & Laser Center",
            location: "South Shore",
            fee: 80,
            rating: 4.6,
            image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=256&h=256&auto=format&fit=crop",
            slots: ["10:00 AM", "01:30 PM", "04:00 PM"]
          },
          {
            id: "5",
            name: "Dr. Anita Gupta",
            specialization: "General Physician",
            experience: 6,
            hospital: "Wellness Point",
            location: "Downtown",
            fee: 40,
            rating: 4.5,
            image: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?q=80&w=256&h=256&auto=format&fit=crop",
            slots: ["08:30 AM", "11:30 AM", "03:00 PM"]
          }
        ],
        appointments: [],
        user: {
          id: "u1",
          name: "Marcus Aurelius",
          email: "marcus@rome.gov",
          phone: "+39 123 456 7890",
          image: "https://i.pravatar.cc/150?u=marcus",
          memberStatus: "Premium Patient"
        }
      };
      await fs.writeFile(DB_PATH, JSON.stringify(initialDb, null, 2));
      return initialDb;
    }
  }

  // API Routes
  app.get("/api/doctors", async (req, res) => {
    const db = await getDb();
    const { specialization } = req.query;
    if (specialization) {
      const filtered = db.doctors.filter((d: any) => 
        d.specialization.toLowerCase() === (specialization as string).toLowerCase()
      );
      return res.json(filtered);
    }
    res.json(db.doctors);
  });

  app.get("/api/doctors/:id", async (req, res) => {
    const db = await getDb();
    const doctor = db.doctors.find((d: any) => d.id === req.params.id);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    res.json(doctor);
  });

  app.post("/api/appointments", async (req, res) => {
    const { doctorId, slot, patientName, patientEmail } = req.body;
    if (!doctorId || !slot || !patientName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const db = await getDb();
    
    // Find doctor and remove slot
    const doctorIndex = db.doctors.findIndex((d: any) => d.id === doctorId);
    if (doctorIndex === -1) return res.status(404).json({ error: "Doctor not found" });
    
    const doctor = db.doctors[doctorIndex];
    const slotIndex = doctor.slots.indexOf(slot);
    if (slotIndex === -1) return res.status(400).json({ error: "Slot not available" });
    
    doctor.slots.splice(slotIndex, 1);

    const appointment = {
      id: Date.now().toString(),
      doctorId,
      slot,
      patientName,
      patientEmail,
      status: "Confirmed",
      createdAt: new Date().toISOString()
    };

    db.appointments.push(appointment);
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
    res.status(201).json(appointment);
  });

  app.delete("/api/appointments/:id", async (req, res) => {
    const db = await getDb();
    const appIndex = db.appointments.findIndex((a: any) => a.id === req.params.id);
    if (appIndex === -1) return res.status(404).json({ error: "Appointment not found" });

    const appointment = db.appointments[appIndex];
    
    // Restore slot to doctor
    const doctor = db.doctors.find((d: any) => d.id === appointment.doctorId);
    if (doctor) {
      if (!doctor.slots.includes(appointment.slot)) {
        doctor.slots.push(appointment.slot);
        // Better time sorting for strings like "09:00 AM"
        doctor.slots.sort((a: string, b: string) => {
          const parseTime = (t: string) => {
            const [time, period] = t.split(' ');
            let [hours, minutes] = time.split(':').map(Number);
            if (period === 'PM' && hours !== 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;
            return hours * 60 + minutes;
          };
          return parseTime(a) - parseTime(b);
        });
      }
    }

    db.appointments.splice(appIndex, 1);
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
    res.status(204).send();
  });

  app.get("/api/appointments", async (req, res) => {
    const db = await getDb();
    res.json(db.appointments);
  });

  app.get("/api/user", async (req, res) => {
    const db = await getDb();
    res.json(db.user);
  });

  app.put("/api/user", async (req, res) => {
    const db = await getDb();
    db.user = { ...db.user, ...req.body };
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
    res.json(db.user);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
