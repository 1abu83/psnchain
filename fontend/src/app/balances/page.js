import BalanceDisplay from '../components/balance-display';

export default function BalancesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-6">Token Balances</h1>
      <BalanceDisplay />
    </div>
  );
}