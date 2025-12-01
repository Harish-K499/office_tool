export async function getHolidays() {
  const res = await fetch("http://127.0.0.1:5000/api/holidays");
  const data = await res.json();
  console.log("📦 API raw data:", data);

  // Handle both cases — with or without 'value'
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.value)) return data.value;
  return [];
}

export async function createHoliday(payload) {
  await fetch("http://127.0.0.1:5000/api/holidays", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function updateHoliday(id, payload) {
  await fetch(`http://127.0.0.1:5000/api/holidays/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function deleteHoliday(id) {
  const res = await fetch(`http://127.0.0.1:5000/api/holidays/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.text();
    console.error("❌ Delete failed:", err);
  } else {
    console.log("🗑️ Holiday deleted:", id);
  }
}
