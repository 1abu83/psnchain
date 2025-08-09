import TransferForm from '../components/transfer-form';

export default function TransferPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-6">Send Tokens</h1>
      <TransferForm />
    </div>
  );
}