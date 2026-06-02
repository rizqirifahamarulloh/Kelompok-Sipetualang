export default function SidebarItemCard({ item, getImageUrl, onClick, rank = null }) {
  const rankColors = ['bg-amber-500', 'bg-gray-400', 'bg-amber-700'];

  return (
    <div
      className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded-xl p-1.5 -mx-1.5 transition-colors"
      onClick={onClick}
    >
      <div className="relative shrink-0">
        <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden">
          <img
            src={getImageUrl(item)}
            alt={item.nama_barang}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/60?text=No+Img'; }}
          />
        </div>
        {rank !== null && rank < 3 && (
          <span className={`absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full text-[9px] font-black flex items-center justify-center text-white shadow ${rankColors[rank]}`}>
            {rank + 1}
          </span>
        )}
      </div>
      <div className="min-w-0">
        <h4 className="text-xs font-bold text-gray-900 mb-0.5 truncate">{item.nama_barang}</h4>
        <p className="text-[11px] font-semibold text-[#00A779]">
          Rp {Number(item.harga_sewa).toLocaleString()} <span className="text-gray-400 font-normal">/Hari</span>
        </p>
        {item.total_disewa !== undefined && (
          <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
            {item.total_disewa || 0}x disewa
          </span>
        )}
      </div>
    </div>
  );
}
