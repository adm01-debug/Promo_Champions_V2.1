import { FC, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Calculator, 
  Percent, 
  DollarSign, 
  TrendingUp,
  Calendar,
  Info,
  RefreshCw
} from 'lucide-react';

interface CommissionCalculatorProps {
  baseSalary?: number;
  commissionRate?: number;
  salesTotal?: number;
  bonusThreshold?: number;
  bonusRate?: number;
}

export const CommissionCalculator: FC<CommissionCalculatorProps> = ({
  baseSalary = 0,
  commissionRate = 5,
  salesTotal = 0,
  bonusThreshold = 100000,
  bonusRate = 2
}) => {
  const [sales, setSales] = useState(salesTotal.toString());
  const [rate, setRate] = useState(commissionRate.toString());

  const salesValue = parseFloat(sales) || 0;
  const rateValue = parseFloat(rate) || 0;
  
  const baseCommission = salesValue * (rateValue / 100);
  const bonusCommission = salesValue > bonusThreshold 
    ? (salesValue - bonusThreshold) * (bonusRate / 100)
    : 0;
  const totalCommission = baseCommission + bonusCommission;
  const totalEarnings = baseSalary + totalCommission;

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <Calculator className="h-5 w-5 text-primary" />
        <h4 className="font-semibold">Calculadora de Comissão</h4>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-sm font-medium mb-2 block">Vendas Totais (R$)</label>
          <Input
            type="number"
            value={sales}
            onChange={(e) => setSales(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Taxa de Comissão (%)</label>
          <Input
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="5"
          />
        </div>
      </div>

      <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Comissão Base</span>
          <span className="font-medium">R$ {baseCommission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
        {bonusCommission > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Bônus (acima de R$ {bonusThreshold.toLocaleString()})</span>
            <span className="font-medium">+ R$ {bonusCommission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
        )}
        <div className="border-t pt-3 flex justify-between text-lg">
          <span className="font-semibold">Total Comissão</span>
          <span className="font-bold text-primary">
            R$ {totalCommission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
        {baseSalary > 0 && (
          <div className="flex justify-between text-muted-foreground">
            <span>Ganho Total (com salário base)</span>
            <span>R$ {totalEarnings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
        )}
      </div>
    </Card>
  );
};

interface ROICalculatorProps {
  onCalculate?: (data: { investment: number; revenue: number; roi: number }) => void;
}

export const ROICalculator: FC<ROICalculatorProps> = ({ onCalculate }) => {
  const [investment, setInvestment] = useState('');
  const [revenue, setRevenue] = useState('');

  const investmentValue = parseFloat(investment) || 0;
  const revenueValue = parseFloat(revenue) || 0;
  
  const profit = revenueValue - investmentValue;
  const roi = investmentValue > 0 ? ((profit / investmentValue) * 100) : 0;
  const paybackMonths = profit > 0 ? Math.ceil(investmentValue / (profit / 12)) : 0;

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h4 className="font-semibold">Calculadora de ROI</h4>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-sm font-medium mb-2 block">Investimento (R$)</label>
          <Input
            type="number"
            value={investment}
            onChange={(e) => setInvestment(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Receita Gerada (R$)</label>
          <Input
            type="number"
            value={revenue}
            onChange={(e) => setRevenue(e.target.value)}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-muted/50 rounded-lg text-center">
          <p className="text-sm text-muted-foreground mb-1">Lucro</p>
          <p className={`text-xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            R$ {profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="p-4 bg-muted/50 rounded-lg text-center">
          <p className="text-sm text-muted-foreground mb-1">ROI</p>
          <p className={`text-xl font-bold ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {roi.toFixed(1)}%
          </p>
        </div>
        <div className="p-4 bg-muted/50 rounded-lg text-center">
          <p className="text-sm text-muted-foreground mb-1">Payback</p>
          <p className="text-xl font-bold">
            {paybackMonths > 0 ? `${paybackMonths} meses` : '-'}
          </p>
        </div>
      </div>
    </Card>
  );
};

interface QuoteBuilderProps {
  products: { id: string; name: string; price: number }[];
  onGenerateQuote?: (items: { productId: string; quantity: number; discount: number }[]) => void;
}

export const QuoteBuilder: FC<QuoteBuilderProps> = ({ products, onGenerateQuote }) => {
  const [items, setItems] = useState<{ productId: string; quantity: number; discount: number }[]>([]);

  const addItem = (productId: string) => {
    if (!items.find(i => i.productId === productId)) {
      setItems([...items, { productId, quantity: 1, discount: 0 }]);
    }
  };

  const updateItem = (productId: string, field: 'quantity' | 'discount', value: number) => {
    setItems(items.map(i => 
      i.productId === productId ? { ...i, [field]: value } : i
    ));
  };

  const removeItem = (productId: string) => {
    setItems(items.filter(i => i.productId !== productId));
  };

  const subtotal = items.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    if (!product) return sum;
    const itemTotal = product.price * item.quantity;
    return sum + itemTotal - (itemTotal * item.discount / 100);
  }, 0);

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <DollarSign className="h-5 w-5 text-primary" />
        <h4 className="font-semibold">Montador de Orçamento</h4>
      </div>

      <div className="mb-4">
        <label className="text-sm font-medium mb-2 block">Adicionar Produto</label>
        <select 
          className="w-full p-2 border rounded-lg bg-background"
          onChange={(e) => e.target.value && addItem(e.target.value)}
          value=""
        >
          <option value="">Selecione um produto...</option>
          {products.filter(p => !items.find(i => i.productId === p.id)).map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} - R$ {product.price.toLocaleString()}
            </option>
          ))}
        </select>
      </div>

      {items.length > 0 && (
        <div className="space-y-3 mb-4">
          {items.map((item) => {
            const product = products.find(p => p.id === item.productId);
            if (!product) return null;
            
            return (
              <div key={item.productId} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    R$ {product.price.toLocaleString()} x {item.quantity}
                  </p>
                </div>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(item.productId, 'quantity', parseInt(e.target.value) || 1)}
                  className="w-20"
                  min={1}
                />
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={item.discount}
                    onChange={(e) => updateItem(item.productId, 'discount', parseFloat(e.target.value) || 0)}
                    className="w-16"
                    min={0}
                    max={100}
                  />
                  <Percent className="h-4 w-4 text-muted-foreground" />
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => removeItem(item.productId)}
                >
                  ✕
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <span className="text-lg font-semibold">Total</span>
        <span className="text-2xl font-bold text-primary">
          R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
      </div>

      {items.length > 0 && (
        <Button className="w-full mt-4" onClick={() => onGenerateQuote?.(items)}>
          Gerar Orçamento
        </Button>
      )}
    </Card>
  );
};
