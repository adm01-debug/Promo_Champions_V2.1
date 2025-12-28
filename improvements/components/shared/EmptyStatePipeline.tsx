import { FC } from 'react';
import { Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const EmptyStatePipeline: FC<{ onCreate: () => void }> = ({ onCreate }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Target className="h-24 w-24 text-purple-500 mb-4" />
      <h3 className="text-xl font-semibold mb-2">Pipeline vazio</h3>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        Nenhuma oportunidade no funil. Crie seu primeiro deal para começar a vender!
      </p>
      <Button onClick={onCreate}>Criar Primeiro Deal</Button>
    </div>
  );
};
