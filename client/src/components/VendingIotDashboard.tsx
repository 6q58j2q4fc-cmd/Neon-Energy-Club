import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Wifi,
  WifiOff,
  Battery,
  Thermometer,
  Package,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  MapPin,
  Wrench,
  RefreshCw,
  Bell,
  BarChart3,
  Zap,
  Activity,
  Settings,
  ChevronRight,
} from 'lucide-react';

// Simulated machine data
interface VendingMachine {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'maintenance';
  lastPing: string;
  temperature: number;
  humidity: number;
  batteryBackup: number;
  totalRevenue: number;
  todayRevenue: number;
  totalSales: number;
  todaySales: number;
  inventory: InventorySlot[];
  alerts: Alert[];
  salesHistory: SaleRecord[];
}

interface InventorySlot {
  slot: number;
  product: string;
  currentStock: number;
  maxCapacity: number;
  price: number;
  lowStockThreshold: number;
}

interface Alert {
  id: string;
  type: 'low_stock' | 'temperature' | 'offline' | 'maintenance' | 'error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

interface SaleRecord {
  id: string;
  product: string;
  amount: number;
  timestamp: string;
  paymentMethod: 'card' | 'cash' | 'mobile';
}

// Generate simulated data
const generateMockMachines = (): VendingMachine[] => {
  const locations = [
    { name: 'Downtown Gym - Main Lobby', address: '123 Fitness Ave, Downtown' },
    { name: 'Tech Park Building A', address: '456 Innovation Dr, Tech District' },
    { name: 'University Student Center', address: '789 Campus Way, University' },
    { name: 'Airport Terminal B', address: 'Terminal B, Gate 15' },
    { name: 'Shopping Mall Food Court', address: '321 Mall Blvd, Level 2' },
  ];

  const products = [
    'NEON Original',
    'NEON Zero Sugar',
    'NEON Tropical',
    'NEON Berry Blast',
    'NEON Citrus Rush',
  ];

  return locations.map((loc, idx) => {
    const isOnline = Math.random() > 0.15;
    const isMaintenance = !isOnline && Math.random() > 0.5;
    
    const inventory: InventorySlot[] = products.map((product, slotIdx) => ({
      slot: slotIdx + 1,
      product,
      currentStock: Math.floor(Math.random() * 20) + 5,
      maxCapacity: 30,
      price: 3.99,
      lowStockThreshold: 5,
    }));

    const alerts: Alert[] = [];
    
    // Generate alerts based on inventory
    inventory.forEach(slot => {
      if (slot.currentStock <= slot.lowStockThreshold) {
        alerts.push({
          id: `alert-${idx}-${slot.slot}`,
          type: 'low_stock',
          severity: slot.currentStock <= 2 ? 'high' : 'medium',
          message: `${slot.product} is running low (${slot.currentStock} remaining)`,
          timestamp: new Date(Date.now() - Math.random() * 3600000),
          acknowledged: Math.random() > 0.7,
        });
      }
    });

    // Random temperature alert
    const temp = 35 + Math.random() * 10;
    if (temp > 42) {
      alerts.push({
        id: `alert-${idx}-temp`,
        type: 'temperature',
        severity: temp > 45 ? 'critical' : 'high',
        message: `Temperature above optimal range: ${temp.toFixed(1)}°F`,
        timestamp: new Date(Date.now() - Math.random() * 1800000),
        acknowledged: false,
      });
    }

    // Generate sales history
    const salesHistory: SaleRecord[] = [];
    for (let i = 0; i < 50; i++) {
      salesHistory.push({
        id: `sale-${idx}-${i}`,
        product: products[Math.floor(Math.random() * products.length)],
        amount: 3.99,
        timestamp: new Date(Date.now() - Math.random() * 86400000 * 7),
        paymentMethod: ['card', 'cash', 'mobile'][Math.floor(Math.random() * 3)] as any,
      });
    }

    return {
      id: `VM-${1000 + idx}`,
      name: `NEON Machine #${1000 + idx}`,
      location: loc.name,
      status: isMaintenance ? 'maintenance' : isOnline ? 'online' : 'offline',
      lastPing: new Date(Date.now() - (isOnline ? Math.random() * 60000 : Math.random() * 3600000)),
      temperature: temp,
      humidity: 40 + Math.random() * 20,
      batteryBackup: 85 + Math.random() * 15,
      totalRevenue: Math.floor(Math.random() * 50000) + 10000,
      todayRevenue: Math.floor(Math.random() * 500) + 100,
      totalSales: Math.floor(Math.random() * 15000) + 3000,
      todaySales: Math.floor(Math.random() * 150) + 30,
      inventory,
      alerts,
      salesHistory,
    };
  });
};

// Status badge component
const StatusBadge = ({ status }: { status: VendingMachine['status'] }) => {
  const config = {
    online: { color: 'bg-green-500', icon: Wifi, text: 'Online' },
    offline: { color: 'bg-red-500', icon: WifiOff, text: 'Offline' },
    maintenance: { color: 'bg-yellow-500', icon: Wrench, text: 'Maintenance' },
  };
  
  const { color, icon: Icon, text } = config[status];
  
  return (
    <Badge className={`${color} text-white flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {text}
    </Badge>
  );
};

// Machine card component
const MachineCard = ({ 
  machine, 
  onSelect 
}: { 
  machine: VendingMachine; 
  onSelect: () => void;
}) => {
  const lowStockCount = machine.inventory.filter(
    s => s.currentStock <= s.lowStockThreshold
  ).length;
  
  const unacknowledgedAlerts = machine.alerts.filter(a => !a.acknowledged).length;

  return (
    <Card 
      className="bg-gray-900/50 border-gray-800 hover:border-[#c8ff00]/50 transition-colors cursor-pointer"
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg text-white">{machine.name}</CardTitle>
            <CardDescription className="flex items-center gap-1 text-gray-400">
              <MapPin className="w-3 h-3" />
              {machine.location}
            </CardDescription>
          </div>
          <StatusBadge status={machine.status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Today's Revenue</div>
            <div className="text-xl font-bold text-[#c8ff00]">
              ${machine.todayRevenue.toLocaleString()}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Today's Sales</div>
            <div className="text-xl font-bold text-white">
              {machine.todaySales}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-gray-400">
              <Thermometer className="w-4 h-4" />
              {machine.temperature.toFixed(1)}°F
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <Battery className="w-4 h-4" />
              {machine.batteryBackup.toFixed(0)}%
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {lowStockCount > 0 && (
              <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                <Package className="w-3 h-3 mr-1" />
                {lowStockCount} Low
              </Badge>
            )}
            {unacknowledgedAlerts > 0 && (
              <Badge variant="outline" className="text-red-400 border-red-400">
                <Bell className="w-3 h-3 mr-1" />
                {unacknowledgedAlerts}
              </Badge>
            )}
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          className="w-full mt-4 text-[#c8ff00] hover:bg-[#c8ff00]/10"
        >
          View Details
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
};

// Machine detail view
const MachineDetail = ({ 
  machine, 
  onBack 
}: { 
  machine: VendingMachine; 
  onBack: () => void;
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={onBack} className="mb-2 -ml-2">
            ← Back to All Machines
          </Button>
          <h2 className="text-2xl font-bold text-white">{machine.name}</h2>
          <p className="text-gray-400 flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {machine.location}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={machine.status} />
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-1" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs">Total Revenue</span>
            </div>
            <div className="text-2xl font-bold text-[#c8ff00]">
              ${machine.totalRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs">Today's Revenue</span>
            </div>
            <div className="text-2xl font-bold text-green-400">
              ${machine.todayRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Package className="w-4 h-4" />
              <span className="text-xs">Total Sales</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {machine.totalSales.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Activity className="w-4 h-4" />
              <span className="text-xs">Today's Sales</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {machine.todaySales}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-800">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="alerts">
            Alerts
            {machine.alerts.filter(a => !a.acknowledged).length > 0 && (
              <Badge className="ml-2 bg-red-500 text-white text-xs">
                {machine.alerts.filter(a => !a.acknowledged).length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sales">Sales History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Machine health */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg">Machine Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 flex items-center gap-1">
                      <Thermometer className="w-4 h-4" />
                      Temperature
                    </span>
                    <span className={machine.temperature > 42 ? 'text-red-400' : 'text-green-400'}>
                      {machine.temperature.toFixed(1)}°F
                    </span>
                  </div>
                  <Progress 
                    value={(machine.temperature - 30) * 5} 
                    className="h-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">Optimal: 35-42°F</p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 flex items-center gap-1">
                      <Activity className="w-4 h-4" />
                      Humidity
                    </span>
                    <span className="text-green-400">
                      {machine.humidity.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={machine.humidity} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">Optimal: 40-60%</p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 flex items-center gap-1">
                      <Battery className="w-4 h-4" />
                      Battery Backup
                    </span>
                    <span className="text-green-400">
                      {machine.batteryBackup.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={machine.batteryBackup} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">UPS Status</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick inventory overview */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg">Inventory Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {machine.inventory.map(slot => (
                  <div key={slot.slot} className="flex items-center gap-4">
                    <div className="w-24 text-sm text-gray-400">
                      Slot {slot.slot}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white">{slot.product}</span>
                        <span className={
                          slot.currentStock <= slot.lowStockThreshold 
                            ? 'text-yellow-400' 
                            : 'text-gray-400'
                        }>
                          {slot.currentStock}/{slot.maxCapacity}
                        </span>
                      </div>
                      <Progress 
                        value={(slot.currentStock / slot.maxCapacity) * 100}
                        className={`h-2 ${
                          slot.currentStock <= slot.lowStockThreshold 
                            ? '[&>div]:bg-yellow-400' 
                            : ''
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Inventory Management</CardTitle>
                <Button className="bg-[#c8ff00] text-black hover:bg-[#b8ef00]">
                  <Wrench className="w-4 h-4 mr-1" />
                  Request Restock
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Slot</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Product</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Stock</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Price</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {machine.inventory.map(slot => (
                      <tr key={slot.slot} className="border-b border-gray-800/50">
                        <td className="py-3 px-4 text-white">{slot.slot}</td>
                        <td className="py-3 px-4 text-white">{slot.product}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={(slot.currentStock / slot.maxCapacity) * 100}
                              className="w-20 h-2"
                            />
                            <span className="text-gray-400">
                              {slot.currentStock}/{slot.maxCapacity}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#c8ff00]">${slot.price}</td>
                        <td className="py-3 px-4">
                          {slot.currentStock <= slot.lowStockThreshold ? (
                            <Badge className="bg-yellow-500/20 text-yellow-400">
                              Low Stock
                            </Badge>
                          ) : (
                            <Badge className="bg-green-500/20 text-green-400">
                              OK
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Active Alerts</CardTitle>
                <Button variant="outline" size="sm">
                  Mark All Read
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {machine.alerts.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-400" />
                  <p>No active alerts</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {machine.alerts.map(alert => (
                    <div 
                      key={alert.id}
                      className={`flex items-start gap-3 p-4 rounded-lg ${
                        alert.acknowledged 
                          ? 'bg-gray-800/30' 
                          : 'bg-gray-800/50 border border-gray-700'
                      }`}
                    >
                      <div className={`p-2 rounded-full ${
                        alert.severity === 'critical' ? 'bg-red-500/20' :
                        alert.severity === 'high' ? 'bg-orange-500/20' :
                        alert.severity === 'medium' ? 'bg-yellow-500/20' :
                        'bg-blue-500/20'
                      }`}>
                        <AlertTriangle className={`w-4 h-4 ${
                          alert.severity === 'critical' ? 'text-red-400' :
                          alert.severity === 'high' ? 'text-orange-400' :
                          alert.severity === 'medium' ? 'text-yellow-400' :
                          'text-blue-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={
                            alert.severity === 'critical' ? 'text-red-400 border-red-400' :
                            alert.severity === 'high' ? 'text-orange-400 border-orange-400' :
                            alert.severity === 'medium' ? 'text-yellow-400 border-yellow-400' :
                            'text-blue-400 border-blue-400'
                          }>
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {alert.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className={alert.acknowledged ? 'text-gray-500' : 'text-white'}>
                          {alert.message}
                        </p>
                      </div>
                      {!alert.acknowledged && (
                        <Button variant="ghost" size="sm">
                          Acknowledge
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Recent Sales</CardTitle>
                <Select defaultValue="7d">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">Last 24h</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Time</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Product</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Amount</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {machine.salesHistory.slice(0, 20).map(sale => (
                      <tr key={sale.id} className="border-b border-gray-800/50">
                        <td className="py-3 px-4 text-gray-400">
                          {sale.timestamp.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-white">{sale.product}</td>
                        <td className="py-3 px-4 text-[#c8ff00]">${sale.amount}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="capitalize">
                            {sale.paymentMethod}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Main dashboard component
export function VendingIotDashboard() {
  const [machines, setMachines] = useState<VendingMachine[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<VendingMachine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Initialize mock data
  useEffect(() => {
    setMachines(generateMockMachines());
    setIsLoading(false);
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMachines(prev => prev.map(machine => ({
        ...machine,
        todayRevenue: machine.todayRevenue + (Math.random() > 0.7 ? 3.99 : 0),
        todaySales: machine.todaySales + (Math.random() > 0.7 ? 1 : 0),
        lastPing: machine.status === 'online' ? new Date() : machine.lastPing,
      })));
      setLastUpdate(new Date());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Calculate summary stats
  const summary = useMemo(() => {
    const online = machines.filter(m => m.status === 'online').length;
    const totalRevenue = machines.reduce((sum, m) => sum + m.todayRevenue, 0);
    const totalSales = machines.reduce((sum, m) => sum + m.todaySales, 0);
    const totalAlerts = machines.reduce(
      (sum, m) => sum + m.alerts.filter(a => !a.acknowledged).length, 
      0
    );
    return { online, totalRevenue, totalSales, totalAlerts };
  }, [machines]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#c8ff00]" />
      </div>
    );
  }

  if (selectedMachine) {
    return (
      <MachineDetail 
        machine={selectedMachine} 
        onBack={() => setSelectedMachine(null)} 
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Zap className="w-7 h-7 text-[#c8ff00]" />
            Vending Machine Dashboard
          </h1>
          <p className="text-gray-400 flex items-center gap-1 mt-1">
            <Clock className="w-4 h-4" />
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh All
          </Button>
          <Button variant="outline" size="sm">
            <BarChart3 className="w-4 h-4 mr-1" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Wifi className="w-4 h-4 text-green-400" />
              <span className="text-xs">Online Machines</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {summary.online}/{machines.length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <DollarSign className="w-4 h-4 text-[#c8ff00]" />
              <span className="text-xs">Today's Revenue</span>
            </div>
            <div className="text-2xl font-bold text-[#c8ff00]">
              ${summary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Package className="w-4 h-4" />
              <span className="text-xs">Today's Sales</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {summary.totalSales}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Bell className="w-4 h-4 text-red-400" />
              <span className="text-xs">Active Alerts</span>
            </div>
            <div className="text-2xl font-bold text-red-400">
              {summary.totalAlerts}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Machine grid */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Your Machines</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {machines.map(machine => (
            <MachineCard 
              key={machine.id} 
              machine={machine}
              onSelect={() => setSelectedMachine(machine)}
            />
          ))}
        </div>
      </div>

      {/* Demo notice */}
      <Card className="bg-[#c8ff00]/10 border-[#c8ff00]/30">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-[#c8ff00] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-medium">Demo Mode</p>
              <p className="text-gray-400 text-sm">
                This dashboard shows simulated data for demonstration purposes. 
                Real IoT integration will connect to your actual vending machines 
                via MQTT/WebSocket for live monitoring.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default VendingIotDashboard;
