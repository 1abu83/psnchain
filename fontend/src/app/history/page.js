import TransactionHistory from '../components/transaction-history';

export default function HistoryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-6">Transaction History</h1>
      <TransactionHistory />
    </div>
  );
}