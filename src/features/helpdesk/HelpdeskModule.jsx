import { useState } from 'react';
import Topbar from '../../components/Topbar';
import { Segmented } from '../../components/ui';
import TicketList from './TicketList';
import TicketDetail from './TicketDetail';
import Reports from './Reports';
import CreateTicketModal from './CreateTicketModal';
import { Plus } from 'lucide-react';

export default function HelpdeskModule({ onOpenMobile }) {
  const [view, setView] = useState('inbox'); // inbox | reports
  const [selectedId, setSelectedId] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState('');

  const inDetail = !!selectedId;

  const subtitle = inDetail
    ? 'Butiran aduan'
    : view === 'inbox'
    ? 'Urus & jejak semua aduan kerosakan'
    : 'Analitik & laporan aduan';

  return (
    <>
      <Topbar
        title="Helpdesk"
        subtitle={subtitle}
        onOpenMobile={onOpenMobile}
        search={!inDetail && view === 'inbox' ? { value: search, onChange: setSearch, placeholder: 'Cari ref, tajuk, aset…' } : undefined}
        actions={
          !inDetail && (
            <div className="hidden sm:block">
              <Segmented
                options={[{ value: 'inbox', label: 'Inbox' }, { value: 'reports', label: 'Reports' }]}
                value={view}
                onChange={setView}
              />
            </div>
          )
        }
      />

      {/* mobile view switch */}
      {!inDetail && (
        <div className="mb-5 flex items-center justify-between sm:hidden">
          <Segmented
            options={[{ value: 'inbox', label: 'Inbox' }, { value: 'reports', label: 'Reports' }]}
            value={view}
            onChange={setView}
          />
          <button className="btn-primary" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
          </button>
        </div>
      )}

      {inDetail ? (
        <TicketDetail ticketId={selectedId} onBack={() => setSelectedId(null)} />
      ) : view === 'inbox' ? (
        <TicketList search={search} onOpenTicket={setSelectedId} onNewTicket={() => setCreateOpen(true)} />
      ) : (
        <Reports onOpenTicket={setSelectedId} />
      )}

      <CreateTicketModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}
