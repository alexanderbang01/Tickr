import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { TradeForm } from "@/components/create/TradeForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Trade Setup",
};

export default async function CreatePage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login?callbackUrl=/create");
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white mb-0.5">New Trade Setup</h1>
        <p className="text-sm text-zinc-600">Share your analysis with the community</p>
      </div>
      <TradeForm />
    </div>
  );
}
