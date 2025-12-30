// Melhoria 94 - Soft Delete Integration
import { useSoftDelete } from '@/improvements/hooks/useSoftDelete';

// Cliente Row
export const ClientRow = ({ client }) => {
  const { deleteRecord } = useSoftDelete('clients');
  return <DeleteButton onDelete={() => deleteRecord(client.id)} itemName={client.name} />;
};

// Deal Card
export const DealCard = ({ deal }) => {
  const { deleteRecord } = useSoftDelete('deals');
  return <DeleteButton onDelete={() => deleteRecord(deal.id)} itemName={deal.title} />;
};

// RecycleBin Page
export const RecycleBin = () => {
  const { deletedRecords, restore } = useSoftDelete('clients');
  return (
    <div>
      {deletedRecords.map(record => (
        <div key={record.id}>
          {record.name}
          <Button onClick={() => restore(record.id)}>Restore</Button>
        </div>
      ))}
    </div>
  );
};
