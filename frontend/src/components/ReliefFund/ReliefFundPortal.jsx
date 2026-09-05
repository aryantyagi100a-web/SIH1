import React, { useState } from 'react';
import { 
  Heart, 
  QrCode, 
  Copy, 
  CheckCircle2, 
  ShieldCheck, 
  Package, 
  DollarSign, 
  Users, 
  Building2, 
  ArrowRight 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const INP_CLS = 'w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white';

const OFFICIAL_ACCOUNTS = [
  { state: 'Sikkim SDMA', fundName: 'Sikkim SDRF Emergency Relief Account', bank: 'SBI (Gangtok Main)', accountNo: '389201948201', ifsc: 'SBIN0000232', upi: 'sdrf.sikkim@sbi' },
  { state: 'Meghalaya SDMA', fundName: 'Meghalaya CM Relief Fund', bank: 'SBI (Shillong Secretariat)', accountNo: '109384729103', ifsc: 'SBIN0003481', upi: 'cmrf.meghalaya@sbi' },
  { state: 'Assam ASDMA', fundName: 'ASDMA Landslide & Flood Relief', bank: 'HDFC Bank (Dispur)', accountNo: '50200029384711', ifsc: 'HDFC0001290', upi: 'asdma.assam@hdfcbank' }
];

export default function ReliefFundPortal() {
  const { t } = useLanguage();
  const [selectedAmount, setSelectedAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedAcc, setCopiedAcc] = useState(null);
  const [pledgeSubmitted, setPledgeSubmitted] = useState(false);
  const [pledgeData, setPledgeData] = useState({ name: '', phone: '', itemType: 'Dry Ration Kits', quantity: 10, state: 'Sikkim' });
  const [donations, setDonations] = useState([
    { id: 1, name: 'Anonymous Citizen', amount: 2500, time: '4 mins ago', target: 'Sikkim SDRF', method: 'UPI' },
    { id: 2, name: 'Guwahati Welfare Trust', amount: 25000, time: '22 mins ago', target: 'Assam Relief Fund', method: 'NEFT' },
    { id: 3, name: 'Tashi Dorjee', amount: 1000, time: '1 hour ago', target: 'East Sikkim Camp', method: 'UPI' },
    { id: 4, name: 'Shillong Youth Collective', amount: 5000, time: '2 hours ago', target: 'Meghalaya Aid', method: 'UPI' }
  ]);

  const handleCopy = (setter, val, id) => {
    navigator.clipboard.writeText(val);
    setter(id !== undefined ? id : true);
    setTimeout(() => setter(id !== undefined ? null : false), 2000);
  };

  const handleDonate = () => {
    const finalAmt = customAmount ? parseInt(customAmount, 10) : selectedAmount;
    if (!finalAmt || finalAmt <= 0) return;
    setDonations([{ id: Date.now(), name: 'Kind Donor (You)', amount: finalAmt, time: 'Just now', target: 'NER SDRF Emergency', method: 'UPI' }, ...donations]);
    alert(`Thank you! A secure UPI payment intent for ₹${finalAmt.toLocaleString('en-IN')} has been generated. Use UPI ID: ner.disaster.relief@gov.in to complete.`);
    setCustomAmount('');
  };

  const handlePledge = (e) => {
    e.preventDefault();
    setPledgeSubmitted(true);
    setTimeout(() => {
      setPledgeSubmitted(false);
      setPledgeData({ name: '', phone: '', itemType: 'Dry Ration Kits', quantity: 10, state: 'Sikkim' });
    }, 4000);
  };

  return (
    <div className="space-y-5 sm:space-y-6 max-w-7xl mx-auto pb-6 sm:pb-12 animate-fade-in py-1">
      <div className="border-b border-neutral-800 pb-4 sm:pb-5">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-neutral-900 border border-neutral-800 rounded-lg flex-shrink-0">
            <Heart className="w-5 h-5 text-red-500 fill-red-500/20" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">{t.reliefTitle || 'Disaster Relief Fund & Community Aid'}</h1>
            <p className="text-[11px] sm:text-xs text-neutral-400 mt-0.5">{t.reliefSubtitle || 'Direct citizen aid for families affected by North East landslides. 100% verified.'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-3 sm:mt-4">
          {[
            { label: 'Total Aid Raised', val: '₹18,42,500', sub: '73.7% of Goal (₹25L)', col: 'text-emerald-400' },
            { label: 'Active Relief Camps', val: '34 Camps', sub: 'Sikkim & Meghalaya', col: 'text-neutral-400' },
            { label: 'Families Sheltered', val: '4,190', sub: 'Directly assisted', col: 'text-neutral-400' },
            { label: 'Tax Benefit', val: '100% Exemption', sub: 'Sec 80G IT Act', col: 'text-neutral-400' }
          ].map((m, i) => (
            <div key={i} className="bg-black border border-neutral-800 p-2.5 sm:p-3 rounded-xl">
              <span className="text-[9px] sm:text-[10px] font-mono text-neutral-400 uppercase block truncate">{m.label}</span>
              <span className="text-base sm:text-lg font-mono font-bold text-white tracking-tight block truncate">{m.val}</span>
              <span className={`text-[9px] sm:text-[10px] ${m.col} block mt-0.5 font-mono truncate`}>{m.sub}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        <div className="lg:col-span-7 space-y-5 sm:space-y-6">
          <div className="bg-black border border-neutral-800 rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2"><DollarSign className="w-4 h-4 text-emerald-400" /> {t.donateNow || 'Quick Direct Contribution'}</h2>
                <p className="text-[11px] sm:text-xs text-neutral-400 mt-0.5">{t.selectAmount || 'Select amount to contribute via UPI'}</p>
              </div>
              <span className="text-[9px] sm:text-[10px] font-mono uppercase bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded-full text-neutral-400">0% Fee</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 sm:mb-4">
              {[500, 1000, 2500, 5000].map((amt) => (
                <button key={amt} type="button" onClick={() => { setSelectedAmount(amt); setCustomAmount(''); }} className={`py-2.5 sm:py-3 rounded-xl text-xs font-mono font-bold border transition-all active:scale-95 ${selectedAmount === amt && !customAmount ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-neutral-900/80 text-neutral-300 border-neutral-800 hover:text-white'}`}>
                  ₹{amt.toLocaleString('en-IN')}
                </button>
              ))}
            </div>

            <input type="number" placeholder={t.customAmount || 'Enter custom amount (₹)'} value={customAmount} onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }} className={`${INP_CLS} py-2.5 mb-4`} />

            <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-center gap-3.5 sm:gap-4">
              <div className="bg-white p-2 sm:p-2.5 rounded-lg flex-shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-neutral-900 rounded flex flex-col items-center justify-center p-1 text-center">
                  <QrCode className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                  <span className="text-[8px] font-mono text-neutral-300 uppercase mt-0.5">SCAN UPI</span>
                </div>
              </div>
              <div className="space-y-1.5 sm:space-y-2 flex-1 text-center sm:text-left w-full truncate">
                <span className="text-[11px] font-bold text-white block">{t.scanQr || 'Scan with GPay, PhonePe, Paytm, or BHIM'}</span>
                <div className="flex items-center gap-2 bg-black border border-neutral-800 px-3 py-1.5 rounded-lg">
                  <span className="text-[10px] sm:text-[11px] font-mono text-neutral-300 truncate">ner.disaster.relief@gov.in</span>
                  <button type="button" onClick={() => handleCopy(setCopiedUpi, 'ner.disaster.relief@gov.in')} className="ml-auto text-neutral-400 hover:text-white p-1">
                    {copiedUpi ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[9px] sm:text-[10px] text-neutral-400">Direct transfer to Central NER Disaster Management Cell.</p>
              </div>
            </div>

            <button type="button" onClick={handleDonate} className="w-full mt-3 sm:mt-4 bg-white hover:bg-neutral-200 text-black py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.15)] active:scale-98">
              <Heart className="w-4 h-4 fill-black" />
              <span>{t.donateNow || 'Proceed with Contribution'} — ₹{(customAmount || selectedAmount || 1000).toLocaleString('en-IN')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-black border border-neutral-800 rounded-2xl p-4 sm:p-5 space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 truncate"><Building2 className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" /> State Bank Accounts</h3>
              <span className="text-[9px] sm:text-[10px] font-mono text-emerald-400 flex items-center gap-1 flex-shrink-0"><ShieldCheck className="w-3.5 h-3.5" /> 80G Exempt</span>
            </div>
            <div className="space-y-3">
              {OFFICIAL_ACCOUNTS.map((acc, idx) => (
                <div key={idx} className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-3 sm:p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{acc.state}</span>
                    <span className="text-[9px] sm:text-[10px] font-mono text-neutral-400 bg-neutral-950 border border-neutral-800 px-2 py-0.5 rounded">{acc.bank}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono">
                    <div className="bg-black/60 p-2 rounded border border-neutral-800/60">
                      <span className="text-[9px] text-neutral-400 block uppercase">A/C Number</span>
                      <div className="flex items-center justify-between text-neutral-200">
                        <span className="truncate">{acc.accountNo}</span>
                        <button onClick={() => handleCopy(setCopiedAcc, acc.accountNo, idx)} className="text-neutral-400 hover:text-white">
                          {copiedAcc === idx ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                    <div className="bg-black/60 p-2 rounded border border-neutral-800/60">
                      <span className="text-[9px] text-neutral-400 block uppercase">IFSC Code</span>
                      <span className="text-neutral-200 block truncate">{acc.ifsc}</span>
                    </div>
                    <div className="bg-black/60 p-2 rounded border border-neutral-800/60">
                      <span className="text-[9px] text-neutral-400 block uppercase">UPI Handle</span>
                      <span className="text-neutral-200 block truncate">{acc.upi}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-5 sm:space-y-6">
          <div className="bg-black border border-neutral-800 rounded-2xl p-4 sm:p-5 space-y-3 sm:space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2"><Package className="w-3.5 h-3.5 text-amber-400" /> {t.pledgeSupplies || 'Pledge Physical Relief Supplies'}</h3>
            {pledgeSubmitted ? (
              <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-4 text-center space-y-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                <span className="text-xs font-bold text-white block">Pledge Registered Successfully!</span>
                <p className="text-[11px] text-emerald-300">Our regional nodal officer will SMS you nearest drop-off depot.</p>
              </div>
            ) : (
              <form onSubmit={handlePledge} className="space-y-3">
                <select value={pledgeData.itemType} onChange={(e) => setPledgeData({ ...pledgeData, itemType: e.target.value })} className={INP_CLS}>
                  {['Dry Ration & Food Kits', 'Drinking Water & Chlorine Tablets', 'First Aid & Medical Kits', 'Warm Blankets & Tents'].map(it => <option key={it} value={it}>{it}</option>)}
                </select>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input type="number" required min="1" placeholder="Quantity" value={pledgeData.quantity} onChange={(e) => setPledgeData({ ...pledgeData, quantity: e.target.value })} className={INP_CLS} />
                  <select value={pledgeData.state} onChange={(e) => setPledgeData({ ...pledgeData, state: e.target.value })} className={INP_CLS}>
                    {['Sikkim', 'Meghalaya', 'Assam', 'Arunachal Pradesh', 'Mizoram'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input type="text" required placeholder="Your Name" value={pledgeData.name} onChange={(e) => setPledgeData({ ...pledgeData, name: e.target.value })} className={INP_CLS} />
                  <input type="tel" required placeholder="Phone" value={pledgeData.phone} onChange={(e) => setPledgeData({ ...pledgeData, phone: e.target.value })} className={INP_CLS} />
                </div>
                <button type="submit" className="w-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 mt-2 active:scale-98">
                  <Package className="w-3.5 h-3.5" />
                  <span>{t.pledgeNow || 'Submit Supply Pledge'}</span>
                </button>
              </form>
            )}
          </div>

          <div className="bg-black border border-neutral-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-neutral-400" /> Recent Community Donations</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="space-y-2">
              {donations.slice(0, 5).map((d) => (
                <div key={d.id} className="flex items-center justify-between p-2 rounded-lg bg-neutral-900/40 border border-neutral-800/60 text-xs">
                  <div className="truncate pr-2">
                    <span className="font-semibold text-white block truncate">{d.name}</span>
                    <span className="text-[10px] text-neutral-400 font-mono block truncate">{d.target} • {d.time}</span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="font-mono font-bold text-emerald-400 block">+₹{d.amount.toLocaleString('en-IN')}</span>
                    <span className="text-[9px] text-neutral-400 uppercase font-mono">{d.method}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
