import { useMemo, useState } from 'react';
import { Modal } from '../../components/ui';
import { CATEGORIES, BUILDINGS, PRIORITIES, SLA_HOURS, assetsByCategory, categoryById } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import { classNames } from '../../lib/utils';
import { Info } from 'lucide-react';

const FREE_TEXT_OPTION = '__freetext__';

export default function CreateTicketModal({ open, onClose }) {
  const { addTicket, showToast } = useApp();

  const [categoryId, setCategoryId] = useState('');
  const [building, setBuilding] = useState('');
  const [assetChoice, setAssetChoice] = useState(''); // asset id | FREE_TEXT_OPTION
  const [assetFreeText, setAssetFreeText] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [errors, setErrors] = useState({});

  const isOthers = categoryId === 'others';

  // cascading asset options filtered by category + building
  const assetOptions = useMemo(() => {
    if (!categoryId || isOthers) return [];
    return assetsByCategory(categoryId, building || undefined);
  }, [categoryId, building, isOthers]);

  const usingFreeText = isOthers || assetChoice === FREE_TEXT_OPTION;

  function reset() {
    setCategoryId('');
    setBuilding('');
    setAssetChoice('');
    setAssetFreeText('');
    setTitle('');
    setDescription('');
    setPriority('Medium');
    setErrors({});
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleCategoryChange(v) {
    setCategoryId(v);
    setAssetChoice('');
    setAssetFreeText('');
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!categoryId) errs.categoryId = 'Pilih kategori';
    if (!building) errs.building = 'Pilih bangunan';
    if (!title.trim()) errs.title = 'Isi tajuk aduan';
    if (usingFreeText && !assetFreeText.trim()) errs.assetFreeText = 'Isi butiran aset / lokasi';
    if (!usingFreeText && !isOthers && !assetChoice) errs.assetChoice = 'Pilih aset';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    let assetId = null;
    let assetName = '';
    if (usingFreeText) {
      assetId = null;
      assetName = assetFreeText.trim();
    } else {
      const asset = assetOptions.find((a) => a.id === assetChoice);
      assetId = asset ? asset.id : null;
      assetName = asset ? asset.name : '';
    }

    addTicket({
      categoryId,
      building,
      assetId,
      assetName,
      assetFreeText: usingFreeText ? assetFreeText.trim() : '',
      title: title.trim(),
      description: description.trim(),
      priority,
      slaHours: SLA_HOURS[priority],
    });

    showToast('Aduan baru dicipta — status: New');
    handleClose();
  }

  const cat = categoryById(categoryId);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Aduan Baru"
      subtitle="Rekod aduan / kerosakan baharu ke dalam sistem Helpdesk"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Kategori *</label>
            <select
              className={classNames('input', errors.categoryId && 'ring-2 ring-rose-400/60')}
              value={categoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              <option value="">— Pilih kategori —</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <p className="mt-1 text-xs text-rose-500">{errors.categoryId}</p>}
          </div>

          {/* Building */}
          <div>
            <label className="label">Bangunan *</label>
            <select
              className={classNames('input', errors.building && 'ring-2 ring-rose-400/60')}
              value={building}
              onChange={(e) => {
                setBuilding(e.target.value);
                setAssetChoice('');
              }}
            >
              <option value="">— Pilih bangunan —</option>
              {BUILDINGS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            {errors.building && <p className="mt-1 text-xs text-rose-500">{errors.building}</p>}
          </div>
        </div>

        {/* Asset cascading OR free text */}
        {!isOthers && categoryId && (
          <div>
            <label className="label">
              Aset {cat ? `(${cat.name})` : ''} *
            </label>
            <select
              className={classNames('input', errors.assetChoice && 'ring-2 ring-rose-400/60')}
              value={assetChoice}
              onChange={(e) => setAssetChoice(e.target.value)}
            >
              <option value="">
                {assetOptions.length
                  ? `— Pilih aset (${assetOptions.length} dijumpai) —`
                  : building
                  ? '— Tiada aset berdaftar untuk bangunan ini —'
                  : '— Pilih bangunan dahulu / semua aset —'}
              </option>
              {assetOptions.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} · {a.code} · {a.location}
                </option>
              ))}
              <option value={FREE_TEXT_OPTION}>➕ Lain-lain / tiada dalam senarai (taip bebas)</option>
            </select>
            {errors.assetChoice && <p className="mt-1 text-xs text-rose-500">{errors.assetChoice}</p>}
          </div>
        )}

        {usingFreeText && (
          <div>
            <label className="label">
              {isOthers ? 'Butiran aset / lokasi (taip bebas)' : 'Aset tiada dalam senarai — taip bebas'} *
            </label>
            <input
              className={classNames('input', errors.assetFreeText && 'ring-2 ring-rose-400/60')}
              value={assetFreeText}
              onChange={(e) => setAssetFreeText(e.target.value)}
              placeholder="cth: Pili air di koridor aras 2, berhampiran bilik rehat"
            />
            {errors.assetFreeText && <p className="mt-1 text-xs text-rose-500">{errors.assetFreeText}</p>}
            <p className="mt-1.5 flex items-start gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Rekod sahaja — tidak dipautkan ke Asset master. Admin boleh semak & jadikan aset baharu kemudian.
            </p>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="label">Tajuk aduan *</label>
          <input
            className={classNames('input', errors.title && 'ring-2 ring-rose-400/60')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="cth: Aircond tidak sejuk di bilik rawatan"
          />
          {errors.title && <p className="mt-1 text-xs text-rose-500">{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="label">Keterangan</label>
          <textarea
            className="input min-h-[90px] resize-y"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Terangkan masalah dengan lebih lanjut…"
          />
        </div>

        {/* Priority */}
        <div>
          <label className="label">Keutamaan (Priority)</label>
          <div className="flex flex-wrap gap-2">
            {PRIORITIES.map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => setPriority(p)}
                className={classNames(
                  'rounded-xl border px-3.5 py-2 text-sm font-medium transition',
                  priority === p
                    ? 'border-accent-400 bg-accent-500/10 text-accent-700 dark:text-accent-300'
                    : 'border-slate-200/70 text-slate-600 hover:bg-slate-500/5 dark:border-white/10 dark:text-slate-300'
                )}
              >
                {p}
                <span className="ml-1.5 text-[11px] text-slate-400">SLA {SLA_HOURS[p]}j</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200/60 dark:border-white/10 pt-4">
          <button type="button" className="btn-soft" onClick={handleClose}>
            Batal
          </button>
          <button type="submit" className="btn-primary">
            Hantar Aduan
          </button>
        </div>
      </form>
    </Modal>
  );
}
