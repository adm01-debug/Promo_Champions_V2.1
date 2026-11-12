import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog';
import { useSupplierMutations } from '@/hooks/suppliers/useSupplierMutations';

interface SupplierProductActionsProps {
  supplierProduct: {
    id: string;
    unit_price: number;
    min_order_quantity: number | null;
    is_preferred: boolean | null;
    suppliers?: { name: string } | null;
  };
  productName: string;
}

export function SupplierProductActions({
  supplierProduct,
  productName,
}: SupplierProductActionsProps) {
  const {
    updateSupplierProduct,
    deleteSupplierProduct,
    isUpdatingSupplierProduct,
    isDeletingSupplierProduct,
  } = useSupplierMutations();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [form, setForm] = useState({
    unit_price: '',
    min_order_quantity: '',
    is_preferred: false,
  });

  const supplierName = supplierProduct.suppliers?.name ?? 'fornecedor';
  const unitPrice = Number(form.unit_price.replace(',', '.'));
  const minQty =
    form.min_order_quantity.trim() === '' ? null : Number(form.min_order_quantity);
  const priceError =
    form.unit_price.trim() === '' || !Number.isFinite(unitPrice) || unitPrice <= 0
      ? 'Informe um preço maior que zero'
      : null;
  const qtyError =
    minQty !== null && (!Number.isInteger(minQty) || minQty < 1)
      ? 'Quantidade mínima deve ser um inteiro ≥ 1'
      : null;

  const openEdit = () => {
    setForm({
      unit_price: String(supplierProduct.unit_price),
      min_order_quantity:
        supplierProduct.min_order_quantity === null
          ? ''
          : String(supplierProduct.min_order_quantity),
      is_preferred: Boolean(supplierProduct.is_preferred),
    });
    setIsEditOpen(true);
  };

  const handleSave = () => {
    if (priceError || qtyError) return;
    updateSupplierProduct(
      {
        id: supplierProduct.id,
        unit_price: unitPrice,
        min_order_quantity: minQty,
        is_preferred: form.is_preferred,
      },
      { onSuccess: () => setIsEditOpen(false) }
    );
  };

  const handleDelete = () => {
    deleteSupplierProduct(supplierProduct.id, {
      onSuccess: () => setIsDeleteOpen(false),
    });
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={openEdit}
        aria-label={`Editar ${productName} de ${supplierName}`}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:text-destructive"
        onClick={() => setIsDeleteOpen(true)}
        aria-label={`Excluir ${productName} de ${supplierName}`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar produto do fornecedor</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {productName} · {supplierName}
          </p>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`sp-price-${supplierProduct.id}`}>Preço Unitário *</Label>
                <Input
                  id={`sp-price-${supplierProduct.id}`}
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.unit_price}
                  onChange={e =>
                    setForm(prev => ({ ...prev, unit_price: e.target.value }))
                  }
                />
                {priceError && <p className="text-xs text-destructive">{priceError}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor={`sp-qty-${supplierProduct.id}`}>Qtd. Mínima</Label>
                <Input
                  id={`sp-qty-${supplierProduct.id}`}
                  type="number"
                  step="1"
                  min="1"
                  value={form.min_order_quantity}
                  onChange={e =>
                    setForm(prev => ({ ...prev, min_order_quantity: e.target.value }))
                  }
                />
                {qtyError && <p className="text-xs text-destructive">{qtyError}</p>}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor={`sp-preferred-${supplierProduct.id}`}>
                Fornecedor preferido
              </Label>
              <Switch
                id={`sp-preferred-${supplierProduct.id}`}
                checked={form.is_preferred}
                onCheckedChange={checked =>
                  setForm(prev => ({ ...prev, is_preferred: checked }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isUpdatingSupplierProduct || Boolean(priceError || qtyError)}
            >
              {isUpdatingSupplierProduct ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDelete}
        title="Excluir produto do fornecedor"
        description={`Remover ${productName} de ${supplierName}? O histórico de preços desta cotação também será apagado. Esta ação não pode ser desfeita.`}
        isDeleting={isDeletingSupplierProduct}
      />
    </div>
  );
}
