import { Link } from 'react-router-dom';
import { CompassIcon } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <EmptyState
        icon={CompassIcon}
        title="Página não encontrada"
        description="O link pode estar quebrado ou a página foi movida."
        action={<Link to="/"><Button variant="secondary">Voltar para a Home</Button></Link>}
      />
    </div>
  );
}
