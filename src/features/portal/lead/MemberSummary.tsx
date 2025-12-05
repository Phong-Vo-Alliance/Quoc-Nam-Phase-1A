import React from 'react';
import { Avatar } from '../components';


const btn = (active = false) =>
`rounded-lg border px-3 py-1 transition ${active ? 'bg-brand-600 text-white border-sky-600 shadow-sm' : 'bg-white text-brand-700 border-brand-200 hover:bg-brand-50'}`;


export const MemberSummary: React.FC<{ data: { n: string; open: number; waiting: number }[] }> = ({ data }) => (
<aside className="border-l p-4">
<h3 className="text-sm font-semibold">Tải công việc theo thành viên</h3>
<div className="mt-2 space-y-2">
{data.map((m) => (
<div key={m.n} className="rounded-xl border p-3">
<div className="flex items-center justify-between text-sm"><span className="font-medium flex items-center gap-2"><Avatar name={m.n} small />{m.n}</span><button className={btn(false)}>Tạo task</button></div>
<div className="mt-2 grid grid-cols-2 gap-2 text-xs"><div className="rounded-lg bg-gray-50 p-2 text-center">Đang mở<br /><span className="text-lg font-semibold">{m.open}</span></div><div className="rounded-lg bg-gray-50 p-2 text-center">Chờ phản hồi<br /><span className="text-lg font-semibold">{m.waiting}</span></div></div>
</div>
))}
</div>
</aside>
);