import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { boardingApi } from '@/api/boarding';
import {
  BOARDING_ORDER_STATUS_LABELS,
} from '../../shared/types';
import type {
  BoardingOrder,
  PetLocationRecord,
  GeoFence,
  GeoFenceAlert,
} from '../../shared/types';
import {
  ArrowLeft, MapPin, AlertTriangle, Clock, Calendar, Plus,
  CircleDot, Target, Ruler, ChevronDown, ChevronUp,
  Navigation, X, Check, Info, Home
} from 'lucide-react';
import { cn } from '@/lib/utils';

type LocationWithAlert = PetLocationRecord & { isOutOfFence: boolean };

export default function PetTracking() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAppStore();

  const [order, setOrder] = useState<BoardingOrder | null>(null);
  const [locations, setLocations] = useState<PetLocationRecord[]>([]);
  const [geoFence, setGeoFence] = useState<GeoFence | null>(null);
  const [alerts, setAlerts] = useState<GeoFenceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showFenceModal, setShowFenceModal] = useState(false);

  const [locDate, setLocDate] = useState(new Date().toISOString().split('T')[0]);
  const [locTime, setLocTime] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });
  const [locAddress, setLocAddress] = useState('');
  const [locNote, setLocNote] = useState('');

  const [fenceAddress, setFenceAddress] = useState('');
  const [fenceRadius, setFenceRadius] = useState(1000);

  useEffect(() => {
    if (!id) return;
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [o, l, f, a] = await Promise.all([
        boardingApi.getOrder(id),
        boardingApi.getOrderLocations(id),
        boardingApi.getGeoFence(id),
        boardingApi.getGeoFenceAlerts(id),
      ]);
      setOrder(o);
      setLocations(l);
      setGeoFence(f);
      setAlerts(a);
      const today = new Date().toISOString().split('T')[0];
      const dateMap: Record<string, boolean> = {};
      l.forEach(loc => { dateMap[loc.date] = true; });
      if (dateMap[today]) {
        dateMap[today] = true;
      } else if (Object.keys(dateMap).length > 0) {
        const latest = Object.keys(dateMap).sort().reverse()[0];
        dateMap[latest] = true;
      }
      setExpandedDates(dateMap);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const isOwner = currentUser?.id === order?.ownerId;
  const isCaregiver = currentUser && (
    ['user-care-001', 'user-care-002', 'user-care-003'].includes(currentUser.id)
  );

  const locationsWithAlert = useMemo<LocationWithAlert[]>(() => {
    if (!geoFence) return locations.map(l => ({ ...l, isOutOfFence: false }));
    return locations.map(loc => {
      const dist = calculateDistance(
        loc.latitude, loc.longitude,
        geoFence.centerLatitude, geoFence.centerLongitude
      );
      return { ...loc, isOutOfFence: dist > geoFence.radiusMeters };
    });
  }, [locations, geoFence]);

  const groupedLocations = useMemo(() => {
    const groups: Record<string, LocationWithAlert[]> = {};
    locationsWithAlert.forEach(loc => {
      if (!groups[loc.date]) groups[loc.date] = [];
      groups[loc.date].push(loc);
    });
    Object.keys(groups).forEach(date => {
      groups[date].sort((a, b) => a.time.localeCompare(b.time));
    });
    return groups;
  }, [locationsWithAlert]);

  const sortedDates = useMemo(() => {
    return Object.keys(groupedLocations).sort().reverse();
  }, [groupedLocations]);

  const toggleDate = (date: string) => {
    setExpandedDates(prev => ({ ...prev, [date]: !prev[date] }));
  };

  function calculateDistance(
    lat1: number, lon1: number,
    lat2: number, lon2: number
  ): number {
    const R = 6371000;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function mockLatLngFromAddress(address: string, baseLat?: number, baseLng?: number): { latitude: number; longitude: number } {
    let hash = 0;
    for (let i = 0; i < address.length; i++) {
      hash = (hash * 31 + address.charCodeAt(i)) >>> 0;
    }
    const rand1 = ((hash % 1000) / 1000 - 0.5) * 0.01;
    const rand2 = (((hash >> 10) % 1000) / 1000 - 0.5) * 0.01;
    const baseL = baseLat ?? 31.2304;
    const baseLo = baseLng ?? 121.4737;
    return {
      latitude: Number((baseL + rand1).toFixed(6)),
      longitude: Number((baseLo + rand2).toFixed(6)),
    };
  }

  const submitLocation = async () => {
    if (!order || !currentUser) return;
    if (!locAddress.trim()) {
      setError('请输入地址');
      return;
    }
    setActionLoading(true);
    try {
      const myCaregiver = await boardingApi.getMyCaregiver(currentUser.id);
      if (!myCaregiver) {
        setError('您不是寄养人，无法上报位置');
        return;
      }
      const centerLat = geoFence?.centerLatitude;
      const centerLng = geoFence?.centerLongitude;
      const { latitude, longitude } = mockLatLngFromAddress(locAddress, centerLat, centerLng);

      await boardingApi.addPetLocation(order.id, {
        caregiverId: myCaregiver.id,
        date: locDate,
        time: locTime,
        latitude,
        longitude,
        addressText: locAddress,
        note: locNote.trim() || undefined,
      });
      setShowLocationModal(false);
      resetLocationForm();
      loadData();
    } catch {
      setError('上报位置失败');
    }
    setActionLoading(false);
  };

  const resetLocationForm = () => {
    setLocDate(new Date().toISOString().split('T')[0]);
    const d = new Date();
    setLocTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
    setLocAddress('');
    setLocNote('');
    setError('');
  };

  const submitFence = async () => {
    if (!order) return;
    if (!fenceAddress.trim()) {
      setError('请输入围栏地址');
      return;
    }
    setActionLoading(true);
    try {
      const { latitude, longitude } = mockLatLngFromAddress(fenceAddress);
      await boardingApi.createGeoFence(order.id, {
        centerLatitude: latitude,
        centerLongitude: longitude,
        radiusMeters: fenceRadius,
        addressText: fenceAddress,
      });
      setShowFenceModal(false);
      setFenceAddress('');
      setFenceRadius(1000);
      setError('');
      loadData();
    } catch {
      setError('创建围栏失败');
    }
    setActionLoading(false);
  };

  const mapBounds = useMemo(() => {
    const allLats: number[] = [];
    const allLngs: number[] = [];
    if (geoFence) {
      allLats.push(geoFence.centerLatitude);
      allLngs.push(geoFence.centerLongitude);
    }
    locationsWithAlert.forEach(l => {
      allLats.push(l.latitude);
      allLngs.push(l.longitude);
    });
    if (allLats.length === 0) {
      return { minLat: 31.22, maxLat: 31.24, minLng: 121.46, maxLng: 121.49 };
    }
    const minLat = Math.min(...allLats) - 0.005;
    const maxLat = Math.max(...allLats) + 0.005;
    const minLng = Math.min(...allLngs) - 0.005;
    const maxLng = Math.max(...allLngs) + 0.005;
    return { minLat, maxLat, minLng, maxLng };
  }, [locationsWithAlert, geoFence]);

  const toMapPosition = (lat: number, lng: number) => {
    const { minLat, maxLat, minLng, maxLng } = mapBounds;
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 100;
    return { x, y };
  };

  if (loading) {
    return <div className="text-center py-16 text-gray-500">加载中...</div>;
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <p className="text-gray-500 mb-4">订单不存在</p>
        <Link to="/boarding" className="text-primary-600 font-medium hover:underline">
          返回寄养服务
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <button
        onClick={() => navigate(`/boarding/orders/${order.id}`)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft className="w-5 h-5" /> 返回订单详情
      </button>

      <div className="bg-gradient-to-r from-primary-500 via-primary-600 to-violet-500 rounded-2xl p-6 mb-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/20 flex-shrink-0 ring-2 ring-white/30">
              <img src={order.petPhoto} alt={order.petName} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold">{order.petName} · GPS 轨迹追踪</h1>
                <span className={`text-sm px-3 py-1 rounded-full border bg-white/20 border-white/30 backdrop-blur-sm`}>
                  {BOARDING_ORDER_STATUS_LABELS[order.status]}
                </span>
              </div>
              <div className="flex items-center gap-4 text-white/80 text-sm">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {order.startDate} ~ {order.endDate}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  共 {locations.length} 条位置记录
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {isOwner && (
              <button
                onClick={() => setShowFenceModal(true)}
                className="bg-white/20 hover:bg-white/30 border border-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Target className="w-4 h-4" />
                {geoFence ? '更新电子围栏' : '设置电子围栏'}
              </button>
            )}
            {isCaregiver && order.status === 'in_progress' && (
              <button
                onClick={() => setShowLocationModal(true)}
                className="bg-white text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-white/90 transition-colors flex items-center gap-2 shadow-md"
              >
                <Plus className="w-4 h-4" /> 上报位置
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl shadow-sm border border-cream-200 overflow-hidden">
            <div className="p-5 border-b border-cream-200 bg-gradient-to-r from-cream-50 to-white">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-500" />
                位置时间线
              </h3>
              <p className="text-sm text-gray-500 mt-1">按日期分组查看所有位置上报</p>
            </div>

            <div className="max-h-[600px] overflow-y-auto">
              {sortedDates.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <MapPin className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>暂无位置记录</p>
                </div>
              )}

              {sortedDates.map((date) => (
                <div key={date} className="relative">
                  <button
                    onClick={() => toggleDate(date)}
                    className="w-full px-5 py-4 flex items-center justify-between hover:bg-cream-50 transition-colors border-b border-cream-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-primary-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-800">{date}</p>
                        <p className="text-xs text-gray-500">
                          {groupedLocations[date].length} 个位置点
                          {groupedLocations[date].some(l => l.isOutOfFence) && (
                            <span className="ml-2 text-rose-500 flex items-center gap-1 inline-flex">
                              <AlertTriangle className="w-3 h-3" />
                              含越界告警
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    {expandedDates[date] ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {expandedDates[date] && (
                    <div className="bg-cream-50/50">
                      {groupedLocations[date].map((loc, idx) => (
                        <div
                          key={loc.id}
                          className="relative pl-12 pr-5 py-4 border-b border-cream-100 last:border-b-0"
                        >
                          {idx < groupedLocations[date].length - 1 && (
                            <div className="absolute left-[30px] top-8 bottom-0 w-0.5 bg-cream-200" />
                          )}
                          <div
                            className={cn(
                              "absolute left-5 top-5 w-4 h-4 rounded-full border-2",
                              loc.isOutOfFence
                                ? "bg-rose-500 border-rose-200 ring-4 ring-rose-100"
                                : "bg-emerald-500 border-emerald-200 ring-4 ring-emerald-50"
                            )}
                          />
                          <div
                            className={cn(
                              "rounded-xl p-4 border transition-all",
                              loc.isOutOfFence
                                ? "bg-rose-50 border-rose-200 border-2"
                                : "bg-white border-cream-200"
                            )}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="font-mono text-sm font-semibold text-gray-700">{loc.time}</span>
                              </div>
                              {loc.isOutOfFence && (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">
                                  <AlertTriangle className="w-3 h-3" />
                                  超出围栏
                                </span>
                              )}
                            </div>
                            <div className="flex items-start gap-2 mb-2">
                              <MapPin className={cn(
                                "w-4 h-4 mt-0.5 flex-shrink-0",
                                loc.isOutOfFence ? "text-rose-500" : "text-primary-500"
                              )} />
                              <p className="text-sm text-gray-700 leading-relaxed">{loc.addressText}</p>
                            </div>
                            {loc.note && (
                              <div className="flex items-start gap-2 text-xs text-gray-500 bg-cream-50 rounded-lg px-3 py-2">
                                <Info className="w-3 h-3 mt-0.5 flex-shrink-0 text-gray-400" />
                                <span>{loc.note}</span>
                              </div>
                            )}
                            <div className="mt-2 text-xs text-gray-400 font-mono">
                              📍 {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {isOwner && (
            <div className="bg-white rounded-2xl shadow-sm border border-cream-200 overflow-hidden mt-6">
              <div className="p-5 border-b border-cream-200 bg-gradient-to-r from-rose-50 to-white">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                  围栏告警记录
                  <span className="text-xs font-normal text-gray-500">({alerts.length})</span>
                </h3>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {alerts.length === 0 && (
                  <div className="text-center py-10 text-gray-400">
                    <Check className="w-10 h-10 mx-auto mb-2 text-emerald-400" />
                    <p className="text-sm">暂无越界告警，宠物很安全</p>
                  </div>
                )}
                {alerts.map(alert => (
                  <div key={alert.id} className="px-5 py-4 border-b border-cream-100 last:border-b-0 hover:bg-rose-50/30 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-sm font-medium text-rose-700">越界告警</span>
                          <span className="text-xs text-gray-400">
                            {new Date(alert.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {alert.addressText}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {geoFence && isOwner && (
            <div className="bg-white rounded-2xl shadow-sm border border-cream-200 overflow-hidden mt-6">
              <div className="p-5 border-b border-cream-200 bg-gradient-to-r from-violet-50 to-white">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Target className="w-5 h-5 text-violet-500" />
                  当前电子围栏
                </h3>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-violet-500" />
                  <span className="text-sm text-gray-700">{geoFence.addressText}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-violet-500" />
                  <span className="text-sm text-gray-700">半径 {geoFence.radiusMeters} 米</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
                  <CircleDot className="w-3 h-3" />
                  中心: {geoFence.centerLatitude.toFixed(4)}, {geoFence.centerLongitude.toFixed(4)}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl shadow-sm border border-cream-200 overflow-hidden">
            <div className="p-5 border-b border-cream-200 bg-gradient-to-r from-sky-50 to-white">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Navigation className="w-5 h-5 text-sky-500" />
                模拟地图视图
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                🟢 围栏内 &nbsp; 🔴 超出围栏
                {geoFence && <span className="ml-2">· 虚线圆圈为安全范围（{geoFence.radiusMeters}m）</span>}
              </p>
            </div>

            <div className="p-5">
              <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-sky-50 via-cream-50 to-violet-50 rounded-xl border-2 border-cream-200 overflow-hidden">
                <div className="absolute inset-0 opacity-30" style={{
                  backgroundImage: `
                    linear-gradient(to right, #d1d5db 1px, transparent 1px),
                    linear-gradient(to bottom, #d1d5db 1px, transparent 1px)
                  `,
                  backgroundSize: '5% 10%'
                }} />

                <div className="absolute left-0 right-0 top-1/2 h-px bg-gray-300/50" />
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gray-300/50" />
                <div className="absolute left-2 top-2 text-xs text-gray-400 font-mono">N</div>
                <div className="absolute left-2 bottom-2 text-xs text-gray-400 font-mono">S</div>
                <div className="absolute right-2 top-2 text-xs text-gray-400 font-mono">E</div>
                <div className="absolute right-2 bottom-2 text-xs text-gray-400 font-mono">W</div>

                {geoFence && (() => {
                  const center = toMapPosition(geoFence.centerLatitude, geoFence.centerLongitude);
                  const edgeLat = geoFence.centerLatitude + (geoFence.radiusMeters / 111000);
                  const edge = toMapPosition(edgeLat, geoFence.centerLongitude);
                  const radiusPct = Math.abs(edge.y - center.y) * 2;
                  return (
                    <>
                      <div
                        className="absolute rounded-full border-2 border-dashed border-violet-400 bg-violet-100/20 pointer-events-none"
                        style={{
                          left: `${center.x}%`,
                          top: `${center.y}%`,
                          width: `${radiusPct}%`,
                          height: `${radiusPct}%`,
                          transform: 'translate(-50%, -50%)',
                        }}
                      />
                      <div
                        className="absolute flex items-center justify-center pointer-events-none"
                        style={{
                          left: `${center.x}%`,
                          top: `${center.y}%`,
                          transform: 'translate(-50%, -50%)',
                        }}
                      >
                        <div className="w-6 h-6 rounded-full bg-violet-500 border-2 border-white shadow-lg flex items-center justify-center">
                          <Target className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      <div
                        className="absolute text-xs font-medium text-violet-600 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full shadow pointer-events-none whitespace-nowrap"
                        style={{
                          left: `${center.x}%`,
                          top: `${center.y}%`,
                          transform: 'translate(-50%, calc(-50% - 24px))',
                        }}
                      >
                        📍 {geoFence.addressText}
                      </div>
                    </>
                  );
                })()}

                {locationsWithAlert.map((loc) => {
                  const pos = toMapPosition(loc.latitude, loc.longitude);
                  const isHovered = hoveredLocation === loc.id;
                  return (
                    <div
                      key={loc.id}
                      className="absolute group"
                      style={{
                        left: `${pos.x}%`,
                        top: `${pos.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      onMouseEnter={() => setHoveredLocation(loc.id)}
                      onMouseLeave={() => setHoveredLocation(null)}
                    >
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full border-2 border-white shadow-md cursor-pointer transition-all duration-200",
                          loc.isOutOfFence
                            ? "bg-rose-500 hover:scale-150 ring-4 ring-rose-200/60"
                            : "bg-emerald-500 hover:scale-150 ring-4 ring-emerald-200/60",
                          isHovered && "scale-150 z-10"
                        )}
                      />
                      {isHovered && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 min-w-[180px]">
                          <div className="bg-gray-900 text-white text-xs rounded-lg shadow-xl p-3">
                            <div className="flex items-center gap-1.5 mb-1 font-medium">
                              <Clock className="w-3 h-3" />
                              {loc.date} {loc.time}
                            </div>
                            <div className="flex items-start gap-1.5 text-gray-200">
                              <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                              <span className="leading-snug">{loc.addressText}</span>
                            </div>
                            {loc.isOutOfFence && (
                              <div className="flex items-center gap-1 mt-1.5 text-rose-300 pt-1.5 border-t border-gray-700">
                                <AlertTriangle className="w-3 h-3" />
                                超出电子围栏
                              </div>
                            )}
                            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-900" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {locationsWithAlert.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">暂无位置数据</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white shadow-sm" />
                    围栏内 ({locationsWithAlert.filter(l => !l.isOutOfFence).length})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500 border border-white shadow-sm" />
                    超出围栏 ({locationsWithAlert.filter(l => l.isOutOfFence).length})
                  </span>
                  {geoFence && (
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-violet-500 border border-white shadow-sm" />
                      围栏中心
                    </span>
                  )}
                </div>
                <span className="font-mono">
                  范围: {mapBounds.minLat.toFixed(3)}~{mapBounds.maxLat.toFixed(3)}, {mapBounds.minLng.toFixed(3)}~{mapBounds.maxLng.toFixed(3)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showLocationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-cream-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary-500" /> 上报宠物位置
              </h3>
              <button onClick={() => { setShowLocationModal(false); resetLocationForm(); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 block mb-1 flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> 日期
                  </label>
                  <input
                    type="date"
                    value={locDate}
                    onChange={e => setLocDate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1 flex items-center gap-1">
                    <Clock className="w-4 h-4" /> 时间
                  </label>
                  <input
                    type="time"
                    value={locTime}
                    onChange={e => setLocTime(e.target.value)}
                    className="w-full px-4 py-2.5 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1 flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> 地址 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={locAddress}
                  onChange={e => setLocAddress(e.target.value)}
                  placeholder="请输入详细地址，如：北京市朝阳区xxx小区"
                  className="w-full px-4 py-2.5 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1">经纬度将根据地址自动模拟生成</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1 flex items-center gap-1">
                  <Info className="w-4 h-4" /> 备注（选填）
                </label>
                <textarea
                  value={locNote}
                  onChange={e => setLocNote(e.target.value)}
                  placeholder="补充说明当前情况，如：正在遛弯、在宠物医院等"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
            <div className="p-6 border-t border-cream-200 flex gap-3">
              <button
                onClick={() => { setShowLocationModal(false); resetLocationForm(); }}
                className="flex-1 px-6 py-3 border border-cream-300 rounded-xl font-medium text-gray-700 hover:bg-cream-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={submitLocation}
                disabled={actionLoading}
                className="flex-1 px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                {actionLoading ? '提交中...' : '确认上报'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showFenceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-cream-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Target className="w-5 h-5 text-violet-500" /> 设置电子围栏
              </h3>
              <button onClick={() => { setShowFenceModal(false); setError(''); setFenceAddress(''); setFenceRadius(1000); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="text-sm text-gray-600 block mb-1 flex items-center gap-1">
                  <Home className="w-4 h-4" /> 围栏中心地址 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={fenceAddress}
                  onChange={e => setFenceAddress(e.target.value)}
                  placeholder="请输入围栏中心地址，如寄养人家地址"
                  className="w-full px-4 py-2.5 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1">经纬度将根据地址自动模拟生成</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Ruler className="w-4 h-4" /> 围栏半径
                  </span>
                  <span className="font-semibold text-violet-600">{fenceRadius} 米</span>
                </label>
                <input
                  type="range"
                  min={500}
                  max={5000}
                  step={100}
                  value={fenceRadius}
                  onChange={e => setFenceRadius(Number(e.target.value))}
                  className="w-full h-2 bg-cream-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>500m</span>
                  <span>2750m</span>
                  <span>5000m</span>
                </div>
              </div>
              <div className="bg-violet-50 border border-violet-100 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-violet-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-violet-700">
                    <p className="font-medium mb-1">电子围栏说明</p>
                    <p className="text-violet-600/80 leading-relaxed">
                      当宠物位置超出设定的半径范围时，系统将自动记录告警并通知您。建议根据实际活动范围合理设置半径。
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-cream-200 flex gap-3">
              <button
                onClick={() => { setShowFenceModal(false); setError(''); setFenceAddress(''); setFenceRadius(1000); }}
                className="flex-1 px-6 py-3 border border-cream-300 rounded-xl font-medium text-gray-700 hover:bg-cream-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={submitFence}
                disabled={actionLoading}
                className="flex-1 px-6 py-3 bg-violet-500 text-white rounded-xl font-medium hover:bg-violet-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Target className="w-4 h-4" />
                {actionLoading ? '创建中...' : (geoFence ? '更新围栏' : '创建围栏')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
