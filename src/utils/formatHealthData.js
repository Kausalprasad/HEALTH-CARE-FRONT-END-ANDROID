// ✅ SAFE, UNIVERSAL FORMATTERS FOR HEALTH CONNECT DATA

export const formatHealthData = {
  // 🪜 STEPS
  steps: records => records.reduce((sum, r) => sum + (r.count || 0), 0),

  // 💓 HEART RATE (handles samples, measurement, or direct bpm)
  heartRate: records => {
    if (!records.length) return 0;

    const values = records.flatMap(r => {
      // type 1: samples array
      if (Array.isArray(r.samples) && r.samples.length > 0) {
        return r.samples
          .map(s => s.beatsPerMinute)
          .filter(v => typeof v === "number" && !isNaN(v));
      }

      // type 2: direct value
      if (typeof r.beatsPerMinute === "number") return [r.beatsPerMinute];

      // type 3: nested measurement object
      if (r.measurement?.value) return [r.measurement.value];

      return [];
    });

    if (!values.length) return 0;

    const avg = values.reduce((s, v) => s + v, 0) / values.length;
    return Math.round(avg);
  },

  // 📏 DISTANCE
  distance: records =>
    records.reduce((sum, r) => sum + (r.distance?.inMeters || 0), 0),

  // 🔥 ACTIVE CALORIES
  activeCalories: records =>
    records.reduce((sum, r) => sum + (r.energy?.inKilocalories || 0), 0),

  // 😴 SLEEP (in hours)
  sleep: records =>
    records.reduce((sum, r) => {
      if (!r.startTime || !r.endTime) return sum;

      const diff = new Date(r.endTime) - new Date(r.startTime);
      return sum + diff / 36e5; // convert ms → hours
    }, 0),

  // 🫁 BLOOD OXYGEN
  bloodOxygen: records => {
    if (!records.length) return 0;

    const values = records
      .map(r => r.percentage || r.value || r.saturation || 0)
      .filter(v => typeof v === "number" && v > 0);

    if (!values.length) return 0;

    const avg = values.reduce((s, v) => s + v, 0) / values.length;
    return Math.round(avg);
  },

  // 🩸 BLOOD PRESSURE
  bloodPressure: records => {
    if (!records.length)
      return { systolic: 0, diastolic: 0 };

    const systolicValues = records.map(
      r => r.systolic?.inMillimetersOfMercury || r.systolic || 0
    );
    const diastolicValues = records.map(
      r => r.diastolic?.inMillimetersOfMercury || r.diastolic || 0
    );

    const systolicAvg =
      systolicValues.reduce((s, v) => s + v, 0) / systolicValues.length;
    const diastolicAvg =
      diastolicValues.reduce((s, v) => s + v, 0) / diastolicValues.length;

    return {
      systolic: Math.round(systolicAvg || 0),
      diastolic: Math.round(diastolicAvg || 0),
    };
  },
};

// 🧾 DISPLAY FORMATTERS
export const formatDisplay = {
  steps: v => v.toLocaleString(),
  heartRate: v => (v ? `${v} bpm` : "--"),
  distance: m =>
    m >= 1000 ? `${(m / 1000).toFixed(2)} km` : `${Math.round(m)} m`,
  activeCalories: v => `${Math.round(v)} kcal`,
  sleep: h => `${h.toFixed(1)} hrs`,
  bloodOxygen: v => (v ? `${v}%` : "--"),
  bloodPressure: v => {
    if (!v || (!v.systolic && !v.diastolic)) return "--/--";
    return `${v.systolic || "--"}/${v.diastolic || "--"}`;
  },
};




