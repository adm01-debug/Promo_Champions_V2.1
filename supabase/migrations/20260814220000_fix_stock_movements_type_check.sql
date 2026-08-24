-- Estoque.tsx / useInventory.ts always send movement_type as 'entry' | 'exit' |
-- 'adjustment' (see the "Deploy Movement" dialog SelectItem values and the
-- useAddStockMovement delta calculation). The check constraint instead only
-- allowed 'in' | 'out' | 'adjustment', so registering an Intake or Release
-- movement from the UI always failed with a check constraint violation.

ALTER TABLE public.stock_movements DROP CONSTRAINT stock_movements_movement_type_check;

ALTER TABLE public.stock_movements
  ADD CONSTRAINT stock_movements_movement_type_check
  CHECK (movement_type = ANY (ARRAY['entry', 'exit', 'adjustment']));
