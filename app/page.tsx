import TipCalculator from "@/components/tip-calculator";

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto mt-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Tip Calculator AI
        </h1>
        <TipCalculator />
      </div>
    </main>
  );
}
