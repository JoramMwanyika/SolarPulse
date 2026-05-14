import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// 1. Manually parse .env.local to avoid requiring 'dotenv' library
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value.length > 0) {
    env[key.trim()] = value.join('=').trim();
  }
});

const SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL'];
// Use Service Role Key to bypass RLS, ensuring inserts work smoothly
const SUPABASE_KEY = env['SUPABASE_SERVICE_ROLE_KEY'] || env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  console.log('Fetching configured sites from database...');
  const { data: sites, error } = await supabase.from('sites').select('*').eq('is_active', true);
  
  if (error) {
    console.error('Error fetching sites:', error);
    return;
  }

  if (!sites || sites.length === 0) {
    console.log('No active sites found in the database. Please add some sites via the dashboard first.');
    return;
  }

  console.log(`Found ${sites.length} active sites. Starting telemetry simulation...`);

  // Start simulating from 8:00 AM
  let simulatedHour = 8;
  let simulatedMinute = 0;

  // Run the simulation loop
  setInterval(async () => {
    // Advance simulated time by 15 minutes every 5 seconds for a cool fast-forward effect
    simulatedMinute += 15;
    if (simulatedMinute >= 60) {
      simulatedMinute = 0;
      simulatedHour += 1;
    }
    // Loop back to 8 AM if it gets to 6 PM (18:00)
    if (simulatedHour >= 18) {
      simulatedHour = 8;
    }

    const timeOfDay = simulatedHour + (simulatedMinute / 60); 
    const now = new Date(); // Use actual timestamp for DB insertion so charts work in real-time

    for (const site of sites) {
      const capacity = site.total_kwp || 10; 
      
      // Simulate normal day curve (parabolic curve peaking at 13:00)
      let currentPower = 0;
      
      // Sun is up roughly between 6 AM and 7 PM (19:00)
      if (timeOfDay > 6 && timeOfDay < 19) {
        const peakHour = 13;
        const width = 6.5; // Hours from peak to zero (6.5 to 19.5)
        const normalizedTime = (timeOfDay - peakHour) / width;
        
        // Parabola: y = 1 - x^2
        currentPower = Math.max(0, (1 - (normalizedTime * normalizedTime)) * capacity);
        
        // Add random noise to simulate clouds/efficiency drops (85% to 100% of the curve)
        currentPower = currentPower * (0.85 + (Math.random() * 0.15));
      }

      const telemetryPoint = {
        site_id: site.id,
        timestamp: now.toISOString(),
        current_power_kw: Number(currentPower.toFixed(2)),
        // Rough estimations for the mockup based on time of day
        daily_energy_kwh: Number((currentPower > 0 ? currentPower * (timeOfDay - 6) * 0.6 : 0).toFixed(2)), 
        total_energy_kwh: Number((capacity * 1500 + currentPower).toFixed(2)), 
        battery_soc: 100, // Fixed at 100% since it's daytime
        grid_import_kw: currentPower < capacity * 0.1 ? Number((capacity * 0.1 - currentPower).toFixed(2)) : 0,
        grid_export_kw: currentPower > capacity * 0.5 ? Number((currentPower - capacity * 0.5).toFixed(2)) : 0,
        inverter_temp: Number((35 + (currentPower / capacity) * 15 + (Math.random() * 5)).toFixed(1)),
        status: 'Online',
        raw_payload: { simulated: true, source: 'mockup_script', simulated_time: `${simulatedHour}:${simulatedMinute.toString().padStart(2, '0')}` }
      };

      const { error: insertError } = await supabase.from('telemetry').insert([telemetryPoint]);
      
      if (insertError) {
        console.error(`❌ Failed to insert telemetry for ${site.site_name}:`, insertError);
      } else {
        const timeStr = `${simulatedHour.toString().padStart(2, '0')}:${simulatedMinute.toString().padStart(2, '0')}`;
        console.log(`[Simulated Time: ${timeStr}] 🟢 ${site.site_name.padEnd(15)} | Power: ${telemetryPoint.current_power_kw.toString().padStart(6)} kW | Status: ${telemetryPoint.status}`);
      }
    }
  }, 5000); // Insert every 5 seconds for a fast demo visualization
  
  console.log('🚀 Simulation started. Sending data every 5 seconds. Press Ctrl+C to stop.');
}

run();
