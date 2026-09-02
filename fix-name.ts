import { getDb } from "./db/client";
import { customers } from "./db/schema/customer";
import { like, eq } from "drizzle-orm";

async function run() {
  const db = getDb();
  
  const badCustomers = await db.query.customers.findMany({
    where: like(customers.name, "% (Yönetici)")
  });

  for (const c of badCustomers) {
    const newName = c.name.replace(" (Yönetici)", "");
    console.log(`Fixing customer ${c.id}: "${c.name}" -> "${newName}"`);
    
    await db.update(customers)
      .set({ name: newName })
      .where(eq(customers.id, c.id));
  }
  
  console.log("Done fixing.");
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
