import { Suspense } from "react";
import { CadastroForm } from "./CadastroForm";

export const metadata = {
  title: "Criar conta — Loop.Talk",
  description: "Crie sua conta e comece a agendar conversas 1:1.",
};

export default function CadastroPage() {
  return (
    <Suspense>
      <CadastroForm />
    </Suspense>
  );
}
