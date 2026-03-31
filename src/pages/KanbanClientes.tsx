import { Helmet } from 'react-helmet-async';
import { ClientKanban } from '@/components/clients/ClientKanban';
import { PageTransition } from '@/components/transitions/PageTransition';
import { motion } from 'framer-motion';

export default function KanbanClientes() {
  return (
    <>
      <Helmet>
        <title>Kanban de Clientes | PROMO CHAMPIONS</title>
        <meta name="description" content="Visualize e gerencie seus clientes por estágio de relacionamento" />
      </Helmet>
      <PageTransition>
        <div className="space-y-4 sm:space-y-6 px-3 py-4 sm:px-4 sm:py-6 lg:px-8 lg:py-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Kanban de Clientes</h1>
            <p className="text-sm text-muted-foreground">Gerencie o relacionamento arrastando clientes entre estágios</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <ClientKanban />
          </motion.div>
        </div>
      </PageTransition>
    </>
  );
}
