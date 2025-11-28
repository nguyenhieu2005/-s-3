const ROWS = 5, COLS = 8
const PRICES = { standard: 50000, vip: 80000, sweet: 150000 }
const MAX_SELECT = 5

function seatTypeByRow(r) {
  if (r <= 2) return 'standard'
  if (r <= 4) return 'vip'
  return 'sweet'
}

const seats = []
for (let r = 1; r <= ROWS; r++) {
  const row = []
  for (let c = 1; c <= COLS; c++) {
    row.push({ id:`R${r}C${c}`, row:r, col:c, type:seatTypeByRow(r), sold:false, selected:false })
  }
  seats.push(row)
}

;(function(){
  const total=ROWS*COLS
  const n=6+Math.floor(Math.random()*7)
  const indices=new Set()
  while(indices.size<n) indices.add(Math.floor(Math.random()*total))
  ;[...indices].forEach(idx=>{ seats[Math.floor(idx/COLS)][idx%COLS].sold=true })
})()

const gridEl=document.getElementById('grid')
const countEl=document.getElementById('count')
const totalEl=document.getElementById('total')
const listEl=document.getElementById('list')
const payBtn=document.getElementById('payBtn')
const resetBtn=document.getElementById('resetBtn')

function renderSeats(){
  if(!gridEl) return
  gridEl.innerHTML=''
  for(let r=0;r<ROWS;r++){
    const label=document.createElement('div')
    label.className='row-label'
    label.textContent=`H${r+1}`
    gridEl.appendChild(label)
    for(let c=0;c<COLS;c++){
      const seat=seats[r][c]
      const el=document.createElement('div')
      el.className=`seat ${seat.type}`+(seat.sold?' sold':seat.selected?' selected':'')
      el.textContent=c+1
      el.onclick=()=>onSeatClick(seat)
      gridEl.appendChild(el)
    }
  }
  updateSummary()
}

function onSeatClick(seat){
  if(seat.sold) return
  const currentSelected=getSelectedSeats()
  if(!seat.selected && currentSelected.length>=MAX_SELECT){
    alert(`Bạn chỉ được chọn tối đa ${MAX_SELECT} ghế trong một lần đặt.`)
    return
  }
  seat.selected=!seat.selected
  renderSeats()
}

function getSelectedSeats(){
  const result=[]
  for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) if(seats[r][c].selected) result.push(seats[r][c])
  return result
}

function calcTotal(selections){ return selections.reduce((sum,s)=>sum+PRICES[s.type],0) }

function updateSummary(){
  const selected=getSelectedSeats()
  if(countEl) countEl.textContent=selected.length
  if(totalEl) totalEl.textContent=calcTotal(selected).toLocaleString('vi-VN')
  if(listEl) listEl.textContent=selected.length?selected.map(s=>s.id).join(', '):'—'
  if(payBtn) payBtn.disabled=selected.length===0
}

if(resetBtn) resetBtn.addEventListener('click',()=>{
  for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) seats[r][c].selected=false
  renderSeats()
})

const backdrop=document.getElementById('modalBackdrop')
const closeModalBtn=document.getElementById('closeModal')
const cancelPayBtn=document.getElementById('cancelPay')
const confirmPayBtn=document.getElementById('confirmPay')
const ticketListEl=document.getElementById('ticketList')
const modalTotalEl=document.getElementById('modalTotal')

function openModal(){
  const selected=getSelectedSeats()
  if(!ticketListEl) return
  ticketListEl.innerHTML=''
  selected.forEach(s=>{
    const name=s.type==='standard'?'Standard':s.type==='vip'?'VIP':'Sweetbox'
    const row=document.createElement('div')
    row.className='tickets'
    const seatCell=document.createElement('div'); seatCell.textContent=s.id
    const typeCell=document.createElement('div'); typeCell.textContent=name
    const priceCell=document.createElement('div'); priceCell.textContent=PRICES[s.type].toLocaleString('vi-VN')+' VND'
    row.appendChild(seatCell); row.appendChild(typeCell); row.appendChild(priceCell)
    ticketListEl.appendChild(row)
  })
  if(modalTotalEl) modalTotalEl.textContent=calcTotal(selected).toLocaleString('vi-VN')
  if(backdrop) backdrop.style.display='flex'
}

function closeModal(){ if(backdrop) backdrop.style.display='none' }

if(payBtn) payBtn.addEventListener('click',openModal)
if(closeModalBtn) closeModalBtn.addEventListener('click',closeModal)
if(cancelPayBtn) cancelPayBtn.addEventListener('click',closeModal)
if(confirmPayBtn) confirmPayBtn.addEventListener('click',()=>{
  alert('Đặt vé thành công! Cảm ơn bạn.')
  for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) seats[r][c].selected=false
  closeModal()
  renderSeats()
})

renderSeats()

const MSSV='00000000'
const STUDENT_NAME='Họ tên của bạn'

const nameEl=document.getElementById('studentName')
const idEl=document.getElementById('studentId')
if(nameEl) nameEl.textContent=STUDENT_NAME
if(idEl) idEl.textContent=`MSSV: ${MSSV}`

const STORAGE_KEY=`tasks_${MSSV}`

function loadTasks(){
  try{const raw=localStorage.getItem(STORAGE_KEY);return raw?JSON.parse(raw):[]}catch{return []}
}
function saveTasks(tasks){ localStorage.setItem(STORAGE_KEY,JSON.stringify(tasks)) }

let tasks=loadTasks()

const form=document.getElementById('taskForm')
const nameInput=document.getElementById('taskName')
const prioritySelect=document.getElementById('priority')

function computeTitleColor(name){
  if(name.length<=10) return ''
  const lastDigit=parseInt(MSSV.slice(-1),10)
  if(isNaN(lastDigit)) return ''
  return lastDigit%2===0?'red':'dodgerblue'
}

function quadrantByPriority(p){
  switch(Number(p)){
    case 1:return'q1'
    case 2:return'q2'
    case 3:return'q3'
    case 4:return'q4'
    default:return'q4'
  }
}

function renderTasks(){
  ['q1','q2','q3','q4'].forEach(id=>{const el=document.getElementById(id);if(el) el.innerHTML=''})
  tasks.forEach(t=>{
    const ul=document.getElementById(quadrantByPriority(t.priority))
    if(!ul) return
    const li=document.createElement('li'); li.className='task-item'
    const title=document.createElement('div'); title.className='title'; title.textContent=t.name
    const color=computeTitleColor(t.name); if(color) title.style.color=color
    const meta=document.createElement('div'); meta.className='meta'; meta.textContent=`Ưu tiên: ${t.priority}`
    const delBtn=document.createElement('button'); delBtn.textContent='Xóa'
    delBtn.style.background='#e74c3c'; delBtn.style.color='#fff'; delBtn.style.border='none'; delBtn.style.borderRadius='8px'; delBtn.style.padding='6px 10px'; delBtn.style.cursor='pointer'
    delBtn.onclick=()=>{ tasks=tasks.filter(x=>x.id!==t.id); saveTasks(tasks); renderTasks() }
    li.appendChild(title); li.appendChild(meta); li.appendChild(delBtn)
    ul.appendChild(li)
  })
}

if(form) form.addEventListener('submit',e=>{
  e.preventDefault()
  const name=nameInput.value.trim()
  const priority=Number(prioritySelect.value)
  if(!name) return
  if(![1,2,3,4].includes(priority)) return
  const newTask={id:Date.now(),name,priority}
  tasks.push(newTask)
  saveTasks(tasks)
  renderTasks()
  form.reset()
})

renderTasks()
