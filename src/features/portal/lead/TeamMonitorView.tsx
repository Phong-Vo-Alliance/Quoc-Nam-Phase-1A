import React from 'react';
import type { LeadThread } from '../types';
import { ThreadTable } from './ThreadTable';
import { MemberSummary } from './MemberSummary';


export const TeamMonitorView: React.FC<{
  leadThreads: LeadThread[];
  assignOpenId: string | null;
  setAssignOpenId: (v: string | null) => void;
  members: string[];
  onAssign: (id: string, member: string, title?: string) => void;
}> = ({ leadThreads, assignOpenId, setAssignOpenId, members, onAssign }) => (
  <div className="mx-auto w-full max-w-[1680px] px-6 pb-12">
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b px-5 py-3">
        <h2 className="text-lg font-medium">Team Monitor – Lead</h2>
        <span className="text-xs text-gray-500">portal.domain.vn</span>
      </div>


      <div className="grid grid-cols-[1fr_320px]">
        <div className="p-4">
          <h3 className="text-sm font-semibold">Active threads (Ai đang chat với ai)</h3>
          <ThreadTable leadThreads={leadThreads} assignOpenId={assignOpenId} setAssignOpenId={setAssignOpenId} members={members} onAssign={onAssign} />
          <div className="mt-4 rounded-xl border p-3">
            <div className="mb-2 flex items-center justify-between text-sm"><div className="font-semibold">Chi tiết thread: PO#1245</div><div className="text-xs text-gray-500">Lead có quyền xem nội dung</div></div>
            <div className="h-28 rounded-md bg-gray-50 p-3 text-xs text-gray-600"><p><span className="font-medium">[09:12] NV A:</span> Anh @Kho ơi, xác nhận giúp lịch <b>nhận hàng</b> 25/10.</p><p><span className="font-medium">[09:15] NV Kho:</span> Ok em, xem ảnh tem đính kèm.</p></div>
          </div>
        </div>
        <MemberSummary data={[{ n: 'Nguyễn An', open: 3, waiting: 1 }, { n: 'Trần Bình', open: 2, waiting: 2 }, { n: 'Lê Chi', open: 1, waiting: 0 }]} />
      </div>
    </section>
  </div>
);