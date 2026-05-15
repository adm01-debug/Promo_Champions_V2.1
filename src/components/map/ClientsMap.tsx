import { useEffect, useMemo, useState, useRef, useCallback, useDeferredValue, memo } from "react";
import { CLIENT_MAP } from "@/config/constants";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MapPin, Filter, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Fix default marker icon
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const SHADOW_URL = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png";
const MARKER_OPTS = { iconSize: [25, 41] as [number, number], iconAnchor: [12, 41] as [number, number], popupAnchor: [1, -34] as [number, number], shadowSize: [41, 41] as [number, number] };

const greenIcon = new L.Icon({ ...MARKER_OPTS, iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png", shadowUrl: SHADOW_URL });
const goldIcon = new L.Icon({ ...MARKER_OPTS, iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png", shadowUrl: SHADOW_URL });
const redIcon = new L.Icon({ ...MARKER_OPTS, iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png", shadowUrl: SHADOW_URL });

interface ClientWithCoords {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  total_value: number;
  lat: number;
  lng: number;
}

function getMarkerIcon(value: number) {
  if (value >= CLIENT_MAP.TIER_PREMIUM) return greenIcon;
  if (value >= CLIENT_MAP.TIER_REGULAR) return goldIcon;
  return redIcon;
}

const geocodeCache = new Map<string, { lat: number; lng: number } | null>();

async function geocodeLocation(location: string): Promise<{ lat: number; lng: number } | null> {
  const key = location.trim().toLowerCase();
  if (geocodeCache.has(key)) return geocodeCache.get(key)!;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(location)}`,
      { headers: { "User-Agent": "SalesArena/1.0" } }
    );
    const data = await res.json();
    if (data.length > 0) {
      const coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      geocodeCache.set(key, coords);
      return coords;
    }
    geocodeCache.set(key, null);
    return null;
  } catch {
    return null;
  }
}

const MarkerClusterGroup = memo(function MarkerClusterGroup({ clients }: { clients: ClientWithCoords[] }) {
  const map = useMap();
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    if (clusterRef.current) map.removeLayer(clusterRef.current);

    const cluster = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: CLIENT_MAP.CLUSTER_RADIUS,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      iconCreateFunction: (c) => {
        const count = c.getChildCount();
        let sz = count > 50 ? 48 : count > 10 ? 40 : 32;
        return L.divIcon({
          html: `<div style="
            background: hsl(var(--primary));
            color: hsl(var(--primary-foreground));
            border-radius: 50%;
            width: ${sz}px; height: ${sz}px;
            display: flex; align-items: center; justify-content: center;
            font-weight: 700; font-size: ${sz > 40 ? 14 : 12}px;
            box-shadow: 0 0 12px hsl(var(--primary) / 0.4);
            border: 2px solid hsl(var(--border));
          ">${count}</div>`,
          className: "",
          iconSize: L.point(sz, sz),
        });
      },
    });

    clients.forEach((client) => {
      const marker = L.marker([client.lat, client.lng], {
        icon: getMarkerIcon(client.total_value),
      });

      const formattedValue = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(client.total_value);
      const popup = `
        <div style="min-width:200px;font-size:12px;font-family:system-ui;">
          <p style="font-weight:700;font-size:14px;margin:0 0 4px">${client.name}</p>
          ${client.company ? `<p style="color:#888;margin:2px 0">🏢 ${client.company}</p>` : ""}
          ${client.email ? `<p style="margin:2px 0">✉️ ${client.email}</p>` : ""}
          ${client.phone ? `<p style="margin:2px 0">📞 ${client.phone}</p>` : ""}
          <div style="border-top:1px solid #333;margin-top:6px;padding-top:4px;display:flex;justify-content:space-between">
            <span style="font-weight:600">Valor Total</span>
            <span style="font-family:monospace;font-weight:700;color:${client.total_value >= CLIENT_MAP.TIER_PREMIUM ? "#22c55e" : "#d4a520"}">${formattedValue}</span>
          </div>
        </div>
      `;
      marker.bindPopup(popup);
      cluster.addLayer(marker);
    });

    map.addLayer(cluster);
    clusterRef.current = cluster;

    if (clients.length > 0) {
      const bounds = L.latLngBounds(clients.map((c) => [c.lat, c.lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: CLIENT_MAP.MAX_FIT_ZOOM });
    }

    return () => {
      if (clusterRef.current) map.removeLayer(clusterRef.current);
    };
  }, [clients, map]);

  return null;
});

export const ClientsMap = () => {
  const [minValue, setMinValue] = useState(0);
  const [selectedCompany, setSelectedCompany] = useState("all");
  const [showFilters, setShowFilters] = useState(true);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodingCount, setGeocodingCount] = useState(0);
  const queryClient = useQueryClient();

  const { data: clients, isLoading } = useQuery({
    queryKey: ["clients-map"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("id, name, company, email, phone, total_value, lat, lng")
        .order("total_value", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const geocodeClients = useCallback(async () => {
    if (!clients || isGeocoding) return;
    const needsGeo = clients.filter((c) => !c.lat && !c.lng && c.company);
    if (needsGeo.length === 0) return;

    setIsGeocoding(true);
    let geocoded = 0;
    for (const client of needsGeo) {
      const coords = await geocodeLocation(client.company!);
      if (coords) {
        await supabase.from("clients").update({ lat: coords.lat, lng: coords.lng }).eq("id", client.id);
        geocoded++;
        setGeocodingCount(geocoded);
      }
      await new Promise((r) => setTimeout(r, CLIENT_MAP.GEOCODE_INTERVAL_MS));
    }
    if (geocoded > 0) {
      queryClient.invalidateQueries({ queryKey: ["clients-map"] });
      toast.success(`${geocoded} clientes geocodificados com sucesso`);
    }
    setIsGeocoding(false);
    setGeocodingCount(0);
  }, [clients, isGeocoding, queryClient]);

  useEffect(() => {
    if (clients && !isGeocoding) {
      const needsGeo = clients.filter((c) => !c.lat && !c.lng && c.company);
      if (needsGeo.length > 0) geocodeClients();
    }
  }, [clients]);

  const allMappable = useMemo(() => {
    if (!clients) return [];
    return clients
      .filter((c) => c.lat != null && c.lng != null && c.lat !== 0)
      .map((c) => ({ ...c, lat: c.lat!, lng: c.lng! } as ClientWithCoords));
  }, [clients]);

  const companies = useMemo(() => {
    const s = new Set<string>();
    allMappable.forEach((c) => { if (c.company) s.add(c.company); });
    return Array.from(s).sort();
  }, [allMappable]);

  const deferredMinValue = useDeferredValue(minValue);
  const deferredCompany = useDeferredValue(selectedCompany);

  const filtered = useMemo(() => {
    return allMappable.filter((c) => {
      if (c.total_value < deferredMinValue) return false;
      if (deferredCompany !== "all" && c.company !== deferredCompany) return false;
      return true;
    });
  }, [allMappable, deferredMinValue, deferredCompany]);

  const totalClients = clients?.length ?? 0;
  const unmappable = totalClients - allMappable.length;
  const hasActiveFilters = minValue > 0 || selectedCompany !== "all";

  const clearFilters = () => { setMinValue(0); setSelectedCompany("all"); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            Mapa de Clientes
          </h2>
          <p className="text-sm text-muted-foreground mt-1" aria-live="polite" aria-atomic="true">
            {filtered.length} de {totalClients} clientes no mapa
            {unmappable > 0 && ` · ${unmappable} sem coordenadas`}
            {hasActiveFilters && " (filtrado)"}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          {isGeocoding && (
            <div className="flex items-center gap-1.5 text-xs text-primary" role="status" aria-live="assertive">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              Geocodificando... {geocodingCount}
            </div>
          )}
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-3.5 w-3.5" />
            Filtros
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 flex items-center justify-center text-[9px]">!</Badge>
            )}
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground" onClick={clearFilters}>
              <X className="h-3.5 w-3.5" /> Limpar
            </Button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="glass rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Valor mínimo: <span className="text-primary font-mono font-bold">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(minValue)}
                </span>
              </Label>
              <Slider value={[minValue]} onValueChange={([v]) => setMinValue(v)} min={0} max={CLIENT_MAP.SLIDER_MAX_VALUE} step={CLIENT_MAP.SLIDER_STEP} />
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                <span>R$0</span><span>R$50k</span><span>R$100k</span><span>R$150k</span><span>R$200k</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Empresa</Label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Todas as empresas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as empresas</SelectItem>
                  {companies.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-muted-foreground pt-1 border-t border-border/30">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-success" /> ≥ R$50k
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-warning" /> R$10k–R$50k
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-destructive" /> &lt; R$10k
            </span>
            <span className="ml-auto font-mono" aria-live="polite">{filtered.length} resultados</span>
          </div>
        </div>
      )}

      <div className="glass rounded-lg overflow-hidden" style={{ height: "500px" }}>
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-muted-foreground animate-pulse">Carregando mapa...</p>
          </div>
        ) : (
          <MapContainer
            center={filtered.length > 0 ? [filtered[0].lat, filtered[0].lng] : CLIENT_MAP.DEFAULT_CENTER}
            zoom={CLIENT_MAP.DEFAULT_ZOOM}
            style={{ height: "100%", width: "100%" }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            <MarkerClusterGroup clients={filtered} />
          </MapContainer>
        )}
      </div>
    </div>
  );
};
