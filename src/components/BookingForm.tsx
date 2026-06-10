import React, { useState } from 'react';
import { collection, setDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from './AuthProvider';
import { TableConfig, Reservation, WarmMessage } from '../types';
import { getRandomPraise, getRandomMock } from '../data/feedbackMessages';
import { LucideIcon, Calendar, Clock, Users, MessageSquare, Utensils, CheckCircle, AlertTriangle, HelpCircle } from 'lucide-react';

export const TABLES: TableConfig[] = [
  { number: 1, capacity: 2, description: "【微光窗景】靠窗幽靜雙人席，微光灑落，適合浪漫密語" },
  { number: 2, capacity: 4, description: "【和風原木】溫馨四人方桌，原木質感，適合摯友小酌談笑" },
  { number: 3, capacity: 4, description: "【歐式沙發】雍容高雅四人圓桌，專屬隔斷，適合商務或關鍵聚餐" },
  { number: 4, capacity: 8, description: "【富麗包廂】尊貴八人旋轉大圓桌，極致寬敞，全家同樂首選" },
  { number: 5, capacity: 2, description: "【主廚鐵板】零距離雙人吧台席，親賭主廚火焰料理與驚人刀工" }
];

interface BookingFormProps {
  onSuccess: (praise: WarmMessage) => void;
  onFailure: (mock: WarmMessage) => void;
  onRefreshList: () => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({ onSuccess, onFailure, onRefreshList }) => {
  const { user, userProfile } = useAuth();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const TIME_SLOTS = [
    '11:30', '12:00', '12:30', '13:00', '13:30',
    '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // 1. Check Date in the past (FAILURE TRIGGER 1 - SARCASM)
      const selectedDateTime = new Date(`${date}T23:59:59`); // end of the selected day
      const now = new Date();
      now.setHours(0, 0, 0, 0); // start of today

      if (!date || new Date(date) < now) {
        setIsSubmitting(false);
        const randMock = getRandomMock();
        onFailure({
          type: 'sarcasm',
          text: `【時間線悖論】${randMock.text} 您預約的日期 (${date || '未填寫'}) 已經淹沒在歷史的洪流中了！本餐廳不招待能扭轉時空的奇异博士。`,
          foodPun: `想要點一盤「後悔藥」嗎？`,
          chefQuote: `「時光倒流服務目前还在測試階段。」`,
          bookingDetails: {
            date: date || '未選擇',
            time: time || '未指定',
            partySize: partySize,
            tableNumber: selectedTable || 0
          }
        });
        return;
      }

      // 2. Validate values
      if (!time) {
        setIsSubmitting(false);
        const randMock = getRandomMock();
        onFailure({
          type: 'sarcasm',
          text: `【飢餓幽靈填寫】${randMock.text} 預訂時間居然空白？沒有時間，難道我們主廚要在夢裡幫您煎牛排嗎？`,
          foodPun: `時間就像醬汁，不倒出來誰知道味道？`,
          chefQuote: `「請選一個能填飽肚子的地球時間點。」`,
          bookingDetails: {
            date: date || '未選擇',
            time: time || '未指定',
            partySize: partySize,
            tableNumber: selectedTable || 0
          }
        });
        return;
      }

      if (selectedTable === null) {
        setIsSubmitting(false);
        const randMock = getRandomMock();
        onFailure({
          type: 'sarcasm',
          text: `【居無定所】${randMock.text} 請先選擇一個您喜歡的桌號！還是您打算自備板凳坐在餐廳大門口吃飯？`,
          foodPun: `沒有桌子，只能用手捧著吃。`,
          chefQuote: `「站著吃的話...本餐廳目前是不打折的。」`,
          bookingDetails: {
            date: date || '未選擇',
            time: time || '未指定',
            partySize: partySize,
            tableNumber: selectedTable || 0
          }
        });
        return;
      }

      const table = TABLES.find(t => t.number === selectedTable);
      if (table && partySize > table.capacity) {
        setIsSubmitting(false);
        const randMock = getRandomMock();
        onFailure({
          type: 'sarcasm',
          text: `【強人所難】${randMock.text} 您預約了 ${partySize} 人，卻擠進上限僅為 ${table.capacity} 人的【桌號 ${table.number}】。雖然我們想抱抱您，但物理法則不允許！`,
          foodPun: `塞太滿，等一下沙拉醬會擠出來。`,
          chefQuote: `「我們提供美味的料理，但不提供沙丁魚罐頭體驗。」`,
          bookingDetails: {
            date: date || '未選擇',
            time: time || '未指定',
            partySize: partySize,
            tableNumber: selectedTable || 0
          }
        });
        return;
      }

      // 3. Double booking checks in live database (FAILURE TRIGGER 2 - MULTI-USER CLASH)
      const resCol = collection(db, 'reservations');
      const q = query(
        resCol,
        where('date', '==', date),
        where('time', '==', time),
        where('tableNumber', '==', selectedTable),
        where('status', '==', 'confirmed')
      );

      const conflictsSnapshot = await getDocs(query(resCol, where('date', '==', date), where('status', '==', 'confirmed'))).catch(err => {
        console.warn("Firestore conflict query error, falling back to local cache:", err);
        return null;
      });

      // Filter in client safely if needed or process snapshots
      let isBooked = false;
      if (conflictsSnapshot) {
        conflictsSnapshot.forEach(docSnap => {
          const d = docSnap.data();
          if (d.time === time && d.tableNumber === selectedTable && d.status === 'confirmed') {
            isBooked = true;
          }
        });
      } else {
        // Fallback conflict check via localStorage cache
        const cached = localStorage.getItem(`reservations_${user.uid}`);
        if (cached) {
          const cachedList: Reservation[] = JSON.parse(cached);
          isBooked = cachedList.some(b => b.date === date && b.time === time && b.tableNumber === selectedTable && b.status === 'confirmed');
        }
      }

      if (isBooked) {
        setIsSubmitting(false);
        const randMock = getRandomMock();
        onFailure({
          type: 'sarcasm',
          text: `【一步慢 步步慢】${randMock.text} 熱門的【桌號 ${selectedTable}】在 ${date} 的 ${time} 時段早就被識貨的尊貴賓客捷足先登了！`,
          foodPun: `真抱歉，香噴噴的位子已經在別人的名下了。`,
          chefQuote: `「這次就當作嗅一嗅別人的幸福香氣吧，下次記得起早點！」`,
          bookingDetails: {
            date: date || '未選擇',
            time: time || '未指定',
            partySize: partySize,
            tableNumber: selectedTable || 0
          }
        });
        return;
      }

      // 4. Booking success! Create the database entry.
      const reservationId = `res_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
      const newBooking: Reservation = {
        reservationId,
        userId: user.uid,
        userName: userProfile?.displayName || user.displayName || '暖色系貴客',
        userEmail: user.email || '',
        date,
        time,
        partySize,
        tableNumber: selectedTable,
        specialRequests: specialRequests.trim(),
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Set write to Firestore
      try {
        await setDoc(doc(db, 'reservations', reservationId), newBooking);
      } catch (err) {
        console.warn("Firestore setDoc booking error, writing to local cache fallback:", err);
      }

      // Always write/add to local storage cache backup!
      const cached = localStorage.getItem(`reservations_${user.uid}`);
      const list: Reservation[] = cached ? JSON.parse(cached) : [];
      list.push(newBooking);
      localStorage.setItem(`reservations_${user.uid}`, JSON.stringify(list));

      // Clear the form
      setDate('');
      setTime('');
      setPartySize(2);
      setSelectedTable(null);
      setSpecialRequests('');

      const randPraise = getRandomPraise();
      onSuccess({
        type: 'praise',
        text: `【尊爵大訂位】🎉 ${randPraise.text} 您成功在 ${date} ${time} 預約了【桌號 ${selectedTable}】(容納 ${partySize} 位賓客)。`,
        foodPun: randPraise.foodPun,
        chefQuote: randPraise.chefQuote,
        bookingDetails: {
          date,
          time,
          partySize,
          tableNumber: selectedTable || 0,
          reservationId
        }
      });

      onRefreshList();

    } catch (err: any) {
      console.error(err);
      onFailure({
        type: 'sarcasm',
        text: `系統發生非預期故障：${err.message || '未知錯誤'}。別慌張，這只是我們的雲端主廚不小心把湯灑在伺服器上而已！`,
        foodPun: `看起來網路線好像被當作起司拉絲扯斷了。`,
        chefQuote: `「請深呼吸，再試一次吧。」`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="booking-container-card" className="bg-white rounded-3xl border border-orange-100 shadow-xl p-6 md:p-8 transition-transform duration-300 hover:shadow-2xl hover:scale-[1.005]">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
          <Utensils className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-serif text-amber-950 font-bold tracking-tight">
            奢華暖金訂位系統
          </h2>
          <p className="text-sm text-amber-700 font-medium">請挑選您的專屬黃金席位</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Guests Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-amber-950 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-orange-500" />
            預訂人數 (Guest Count)
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {[1, 2, 3, 4, 5, 8, 10, 12].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => {
                  setPartySize(num);
                  // Auto-unselect if the current selected table can't hold them
                  if (selectedTable !== null) {
                    const tableObj = TABLES.find(t => t.number === selectedTable);
                    if (tableObj && num > tableObj.capacity) {
                      setSelectedTable(null);
                    }
                  }
                }}
                className={`py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                  partySize === num
                    ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20 scale-105'
                    : 'bg-amber-50/50 text-amber-900 border-amber-100 hover:bg-amber-50 hover:border-amber-200'
                }`}
              >
                {num} 人
              </button>
            ))}
          </div>
        </div>

        {/* 2. Select Table */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-amber-950 flex items-center gap-1.5">
            <Utensils className="w-4 h-4 text-orange-500" />
            桌號與情境選擇 (Table Class)
          </label>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {TABLES.map((table) => {
              const tooSmall = partySize > table.capacity;
              return (
                <div
                  key={table.number}
                  onClick={() => !tooSmall && setSelectedTable(table.number)}
                  className={`p-3.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                    tooSmall 
                      ? 'bg-gray-50/50 border-gray-100 opacity-40 cursor-not-allowed'
                      : selectedTable === table.number
                        ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/20 shadow-sm cursor-pointer'
                        : 'bg-amber-50/20 border-orange-100/40 hover:bg-amber-50/40 hover:border-orange-200/60 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-serif text-sm font-medium ${selectedTable === table.number ? 'text-amber-950 font-bold' : 'text-amber-900'}`}>
                      桌號 #{table.number} — 最大容量 {table.capacity} 人
                    </span>
                    {tooSmall ? (
                      <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded font-bold border border-red-100">
                        容納上限不足 {partySize} 人
                      </span>
                    ) : (
                      selectedTable === table.number && (
                        <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold">
                          已選定
                        </span>
                      )
                    )}
                  </div>
                  <p className="text-xs text-amber-800 mt-1">{table.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Date & Time Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-amber-950 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-orange-500" />
              用餐日期 (Date)
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 rounded-2xl border border-orange-100 bg-amber-50/20 text-amber-950 font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-amber-950 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-orange-500" />
              用餐時間 (Time)
            </label>
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full p-3 rounded-2xl border border-orange-100 bg-amber-50/20 text-amber-950 font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
              required
            >
              <option value="">-- 選擇時間段 --</option>
              {TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {slot} ({parseInt(slot.split(':')[0]) < 15 ? '午間雅宴' : '夜幕盛典'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 4. Special Requests */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-amber-950 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-orange-500" />
            客製化私房備註 (Special Requests)
          </label>
          <textarea
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            placeholder="例如：提子過敏、慶祝週年紀念、需要準備嬰兒椅等..."
            rows={2}
            className="w-full p-3.5 rounded-2xl border border-orange-100 bg-amber-50/20 text-amber-950 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none resize-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-4 rounded-2xl text-white font-bold font-serif text-lg transition-all duration-300 tracking-wider shadow-lg shadow-orange-700/15 ${
            isSubmitting
              ? 'bg-amber-300 cursor-not-allowed text-amber-100'
              : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
          }`}
        >
          {isSubmitting ? '主廚精心烹製訂單中...' : '送交主廚 🍽️ 馬上預約！'}
        </button>
      </form>
    </div>
  );
};
