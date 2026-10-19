export const leads = [
  { id: "LD-101", name: "Aarav Sharma", company: "Acme Pvt Ltd", source: "Website", status: "Qualified", salesperson: "Priya", value: 120000, createdAt: "2026-10-19" },
  { id: "LD-102", name: "Riya Verma", company: "NovaTech", source: "Referral", status: "New", salesperson: "Rahul", value: 85000, createdAt: "2026-10-18" },
  { id: "LD-103", name: "Kabir Singh", company: "Bright Solutions", source: "LinkedIn", status: "Contacted", salesperson: "Priya", value: 200000, createdAt: "2026-10-17" },
  { id: "LD-104", name: "Ananya Gupta", company: "GreenLeaf", source: "Website", status: "Converted", salesperson: "Amit", value: 150000, createdAt: "2026-10-15" },
  { id: "LD-105", name: "Ishaan Patel", company: "PixelWorks", source: "Campaign", status: "Lost", salesperson: "Rahul", value: 60000, createdAt: "2026-10-10" },
  { id: "LD-106", name: "Meera Joshi", company: "CloudNine", source: "Referral", status: "Qualified", salesperson: "Amit", value: 175000, createdAt: "2026-10-05" },
  { id: "LD-107", name: "Vivaan Kapoor", company: "Orbit Media", source: "LinkedIn", status: "New", salesperson: "Priya", value: 95000, createdAt: "2026-10-03" },
  { id: "LD-108", name: "Sana Khan", company: "UrbanNest", source: "Website", status: "Qualified", salesperson: "Rahul", value: 135000, createdAt: "2026-09-28" },
  { id: "LD-109", name: "Arjun Mehta", company: "FinEdge", source: "Campaign", status: "Converted", salesperson: "Amit", value: 225000, createdAt: "2026-09-21" },
  { id: "LD-110", name: "Diya Rao", company: "PixelCraft", source: "Referral", status: "Contacted", salesperson: "Priya", value: 110000, createdAt: "2026-09-14" },
];

export const quotations = [
  { id: "QUO-101", leadId: "LD-101", category: "Web Development", amount: 120000, status: "Accepted", date: "2026-10-19" },
  { id: "QUO-102", leadId: "LD-102", category: "UI/UX Design", amount: 85000, status: "Sent", date: "2026-10-18" },
  { id: "QUO-103", leadId: "LD-103", category: "Mobile App", amount: 200000, status: "Negotiation", date: "2026-10-17" },
  { id: "QUO-104", leadId: "LD-104", category: "Web Development", amount: 150000, status: "Accepted", date: "2026-10-15" },
  { id: "QUO-105", leadId: "LD-106", category: "Cloud Services", amount: 175000, status: "Draft", date: "2026-10-05" },
  { id: "QUO-106", leadId: "LD-109", category: "Consulting", amount: 225000, status: "Accepted", date: "2026-09-21" },
  { id: "QUO-107", leadId: "LD-108", category: "UI/UX Design", amount: 135000, status: "Sent", date: "2026-09-28" },
];

export const deals = [
  { id: "DEAL-101", leadId: "LD-101", quotationId: "QUO-101", title: "Acme Website Revamp", value: 120000, priority: "High", progress: 75, status: "In Progress", expectedClose: "2026-10-25", createdAt: "2026-10-19" },
  { id: "DEAL-102", leadId: "LD-104", quotationId: "QUO-104", title: "GreenLeaf Business Website", value: 150000, priority: "Medium", progress: 100, status: "Won", expectedClose: "2026-10-15", createdAt: "2026-10-15" },
  { id: "DEAL-103", leadId: "LD-103", quotationId: "QUO-103", title: "Bright Solutions App", value: 200000, priority: "High", progress: 40, status: "Negotiation", expectedClose: "2026-10-28", createdAt: "2026-10-17" },
  { id: "DEAL-104", leadId: "LD-109", quotationId: "QUO-106", title: "FinEdge Analytics", value: 225000, priority: "High", progress: 100, status: "Won", expectedClose: "2026-09-30", createdAt: "2026-09-21" },
];

export const orders = [
  { id: "ORD-101", dealId: "DEAL-101", customer: "Acme Pvt Ltd", amount: 120000, status: "In Progress", date: "2026-10-19" },
  { id: "ORD-102", dealId: "DEAL-102", customer: "GreenLeaf", amount: 150000, status: "Completed", date: "2026-10-16" },
  { id: "ORD-103", dealId: "DEAL-104", customer: "FinEdge", amount: 225000, status: "Completed", date: "2026-09-25" },
];

export const payments = [
  { id: "PAY-101", orderId: "ORD-101", amount: 60000, method: "UPI", status: "Paid", date: "2026-10-19" },
  { id: "PAY-102", orderId: "ORD-101", amount: 60000, method: "Bank Transfer", status: "Pending", date: "2026-10-19" },
  { id: "PAY-103", orderId: "ORD-102", amount: 150000, method: "Bank Transfer", status: "Paid", date: "2026-10-16" },
  { id: "PAY-104", orderId: "ORD-103", amount: 225000, method: "Card", status: "Paid", date: "2026-09-25" },
];
