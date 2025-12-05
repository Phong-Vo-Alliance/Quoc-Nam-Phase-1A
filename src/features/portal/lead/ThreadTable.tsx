import React from 'react';
import type { LeadThread } from '../types';
import { Avatar, Badge } from '../components';


const btn = (active = false) =>
  `rounded-lg border px-3 py-1 transition ${active ? 'bg-brand-600 text-white border-sky-600 shadow-sm' : 'bg-white text-brand-700 border-brand-200 hover:bg-brand-50'}`;
const inputCls =
  'rounded-lg border px-3 py-2 text-sm border-brand-200 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-sky-300';

export const ThreadTable: React.FC<{
  leadThreads: LeadThread[];
  assignOpenId: string | null;
  setAssignOpenId: (v: string | null) => void;
  members: string[];
  onAssign: (id: string, member: string, title?: string) => void;
}> = ({ leadThreads, assignOpenId, setAssignOpenId, members, onAssign }) => (
  <div className="mt-2 overflow-hidden rounded-xl border">
    <table className="w-full text-left text-sm">
      <thead className="bg-gray-50 text-gray-500">
        <tr>
          <th className="px-3 py-2">Thread</th>
          <th className="px-3 py-2">Loại</th>
          <th className="px-3 py-2">NV phụ trách</th>
          <th className="px-3 py-2">Trạng thái</th>
          <th className="px-3 py-2">Cập nhật</th>
          <th className="px-3 py-2 text-right">Hành động</th>
        </tr>
      </thead>
      <tbody>
        {leadThreads.map((r) => (
          <tr key={r.id} className="border-t">
            <td className="px-3 py-2">{r.t}</td>
            <td className="px-3 py-2">{r.type}</td>
            <td className="px-3 py-2"><div className="flex items-center gap-2"><Avatar name={r.owner} small />{r.owner}</div></td>
            <td className="px-3 py-2">{r.st === 'Đã chốt' ? <Badge type="done">Đã chốt</Badge> : r.st === 'Chờ phản hồi' ? <Badge type="waiting">Chờ phản hồi</Badge> : <Badge type="processing">Đang xử lý</Badge>}</td>
            <td className="px-3 py-2 text-gray-500">{r.at}</td>
            <td className="px-3 py-2 text-right">
              {assignOpenId === r.id ? (
                <div className="inline-flex items-center gap-2">
                  <select className={inputCls} defaultValue="" onChange={(e) => e.target.value && onAssign(r.id, e.target.value, r.t)}>
                    <option value="" disabled>Chọn người nhận…</option>
                    {members.map((m) => (<option key={m} value={m}>{m}</option>))}
                  </select>
                  <button className={btn(false)} onClick={() => setAssignOpenId(null)}>Hủy</button>
                </div>
              ) : (
                <button className={btn(false)} onClick={() => setAssignOpenId(r.id)}>Assign/Transfer</button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);