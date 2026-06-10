import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from './AuthProvider';
import { Reservation, WarmMessage } from '../types';
import { TABLES } from './BookingForm';
import { Calendar, Clock, Users, Coffee, Ban, RefreshCw, Trash2 } from 'lucide-react';
import { getRandomPraise, getRandomMock } from '../data/feedbackMessages';

interface MyReservationsProps {
  onSuccess: (praise: WarmMessage) => void;
  onFailure: (mock: WarmMessage) => void;
  refreshTrigger: number;
  onRefreshTrigger: () => void;
}

export const MyReservations: React.FC<MyReservationsProps> = ({ onSuccess, onFailure, refreshTrigger, onRefreshTrigger }) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    if (!user) return;
    setLoading(true);
    const path = 'reservations';
    try {
      const resCol = collection(db, path);
      // We can query by userId. Note: To order by date we might need an index, so let's fetch and sort in client to avoid requiring custom Firebase indexes
      const q = query(resCol, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const list: Reservation[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          ...(data as Reservation),
          reservationId: docSnap.id // override doc ID
        });
      });

      // Sort by date and time in descending order
      list.sort((a, b) => {
        const dateTimeA = new Date(`${a.date}T${a.time}`);
        const dateTimeB = new Date(`${b.date}T${b.time}`);
        return dateTimeB.getTime() - dateTimeA.getTime();
      });

      setBookings(list);
      // Cache list locally for backup
      localStorage.setItem(`reservations_${user.uid}`, JSON.stringify(list));
    } catch (err) {
      console.warn("Firestore fetchBookings error, falling back to local cache:", err);
      const cached = localStorage.getItem(`reservations_${user.uid}`);
      if (cached) {
        setBookings(JSON.parse(cached));
      } else {
        setBookings([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user, refreshTrigger]);

  const handleCancel = async (booking: Reservation) => {
    if (!user) return;
    const confirmCancel = window.confirm("確定要取消這項無比精緻的私房午茶/雅宴預訂嗎？主廚聽過會傷心的！");
    if (!confirmCancel) return;

    try {
      const docRef = doc(db, 'reservations', booking.reservationId);
      await updateDoc(docRef, {
        status: 'cancelled',
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn("Firestore handleCancel error, updating local cache only:", err);
    }

    // Always update local storage cache!
    const cached = localStorage.getItem(`reservations_${user.uid}`);
    let list: Reservation[] = cached ? JSON.parse(cached) : [];
    list = list.map(b => b.reservationId === booking.reservationId ? { ...b, status: 'cancelled', updatedAt: new Date().toISOString() } : b);
    localStorage.setItem(`reservations_${user.uid}`, JSON.stringify(list));
    setBookings(list);

    const mockMsg = getRandomMock();
    onFailure({
      type: 'sarcasm',
      text: `【退票玩家】${mockMsg.text} 您取消了 ${booking.date} ${booking.time} 的【桌號 ${booking.tableNumber}】預訂！我們的主廚剛磨好的刀叉只能默默收回去了...`,
      foodPun: `再會了，那熟度極致完美的 A5 和牛熟成排！`,
      chefQuote: `「沒關係，我們會把桌子擦得更乾淨，留給真正想吃的人。」`,
      bookingDetails: {
        date: booking.date,
        time: booking.time,
        partySize: booking.partySize,
        tableNumber: booking.tableNumber,
        reservationId: booking.reservationId
      }
    });

    onRefreshTrigger();
  };

  const handleDelete = async (booking: Reservation) => {
    if (!user) return;
    const confirmDel = window.confirm("確定要把這條紀錄從資料庫歷史中徹底刪除嗎？這將不會留下任何指紋！");
    if (!confirmDel) return;

    try {
      const docRef = doc(db, 'reservations', booking.reservationId);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn("Firestore handleDelete error, removing from local cache only:", err);
    }

    // Always update local storage cache!
    const cached = localStorage.getItem(`reservations_${user.uid}`);
    let list: Reservation[] = cached ? JSON.parse(cached) : [];
    list = list.filter(b => b.reservationId !== booking.reservationId);
    localStorage.setItem(`reservations_${user.uid}`, JSON.stringify(list));
    setBookings(list);

    const praiseMsg = getRandomPraise();
    onSuccess({
      type: 'praise',
      text: `【銷聲匿跡】🧹 痕跡清理乾淨了！ ${booking.date} ${booking.time} 的桌子已被送進異次元，沒有人會知道您在這個時空做過這筆訂單！`,
      foodPun: `像泡沫一樣蒸發掉，毫無熱量負擔。`,
      chefQuote: `「這才叫做不留痕跡的雅致。」`,
      bookingDetails: {
        date: booking.date,
        time: booking.time,
        partySize: booking.partySize,
        tableNumber: booking.tableNumber,
        reservationId: booking.reservationId
      }
    });

    onRefreshTrigger();
  };

  if (!user) return null;

  return (
    <div id="reservations-list-container" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif text-amber-950 font-bold tracking-tight">
            我的訂位明細 (My Reservations)
          </h2>
          <p className="text-sm text-amber-700 font-medium">即時儲存於雲端資料庫的個人預訂日誌</p>
        </div>
        <button
          onClick={fetchBookings}
          disabled={loading}
          className="p-2.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          title="刷新訂单"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-amber-50/20 rounded-3xl border border-orange-100/40">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-amber-800 font-semibold mt-4">主廚正在幫您翻閱預約名冊...</span>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center p-12 bg-amber-50/20 rounded-3xl border border-dashed border-amber-200 flex flex-col items-center">
          <Coffee className="w-12 h-12 text-amber-300 mb-4" />
          <h3 className="text-lg font-serif font-bold text-amber-900 mb-2">肚子空空，名冊也空空！</h3>
          <p className="text-sm text-amber-700 max-w-sm">
            您居然完全沒有任何一筆預訂！難道您打算跟行道樹下的麻雀一起吃路邊的落葉過日子嗎？趕快去主餐區預訂桌子吧！
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookings.map((booking) => {
            const tableConfig = TABLES.find(t => t.number === booking.tableNumber);
            const isConfirmed = booking.status === 'confirmed';
            
            return (
              <div
                key={booking.reservationId}
                id={`booking-card-${booking.reservationId}`}
                className={`bg-white rounded-2xl border border-orange-100/60 p-5 shadow-md flex flex-col justify-between transition-transform duration-200 hover:scale-[1.01] hover:shadow-lg relative overflow-hidden`}
              >
                {/* Visual side trim for status */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isConfirmed ? 'bg-amber-500' : 'bg-red-400'}`} />

                <div>
                  <div className="flex items-start justify-between mb-3.5 pl-2">
                    <div>
                      <span className="text-xs text-amber-600 font-mono tracking-wider block font-bold">
                        ID: {booking.reservationId.slice(0, 10)}...
                      </span>
                      <h4 className="font-serif text-base text-amber-950 font-bold mt-0.5">
                        {isConfirmed ? '🍽️ 席位確認' : '💤 預約已取消'}
                      </h4>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      isConfirmed
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                      {isConfirmed ? '預訂成功' : '已取消'}
                    </span>
                  </div>

                  <div className="space-y-2 pl-2">
                    <div className="flex items-center text-sm text-amber-900 gap-2">
                      <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="font-semibold">{booking.date}</span>
                    </div>

                    <div className="flex items-center text-sm text-amber-900 gap-2">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="font-semibold">{booking.time} ({parseInt(booking.time.split(':')[0]) < 15 ? '午宴' : '晚宴'})</span>
                    </div>

                    <div className="flex items-center text-sm text-amber-900 gap-2">
                      <Users className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{booking.partySize} 位尊客 (客座 <b>#{booking.tableNumber}</b>)</span>
                    </div>

                    {booking.specialRequests ? (
                      <div className="mt-3 bg-amber-50/40 p-2.5 rounded-xl border border-amber-100/50">
                        <span className="text-[11px] uppercase tracking-wide font-bold text-amber-800 block">備註摘要:</span>
                        <p className="text-xs text-amber-950 italic mt-0.5">{booking.specialRequests}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-amber-500 italic mt-2 ml-1">無客製化要求</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-5 pl-2 pt-3 border-t border-orange-50/50">
                  {isConfirmed ? (
                    <button
                      onClick={() => handleCancel(booking)}
                      className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold text-red-600 hover:text-white hover:bg-red-500 border border-red-200 hover:border-red-500 rounded-xl transition-colors duration-200 cursor-pointer"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      取消這筆預訂
                    </button>
                  ) : (
                    <div className="flex-1 text-xs text-red-400 italic flex items-center gap-1 py-2">
                      已自動保留客席於備份歸檔
                    </div>
                  )}

                  <button
                    onClick={() => handleDelete(booking)}
                    className="p-2 text-amber-500 hover:text-white hover:bg-amber-600 border border-amber-200 hover:border-amber-600 rounded-xl transition-all duration-200 cursor-pointer"
                    title="從我的名單中移除此紀錄"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
