import { listCreators } from "@/lib/creators";
import { ExplorarClient } from "./ExplorarClient";

export const dynamic = "force-dynamic";

export default async function Explorar() {
  const creators = await listCreators();
  return <ExplorarClient creators={creators} />;
}
