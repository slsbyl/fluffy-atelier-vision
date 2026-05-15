import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
  // 1. قراءة بيانات المستخدم من التخزين المحلي
  const userString = localStorage.getItem('user'); 
  const user = userString ? JSON.parse(userString) : null;

  console.log("🔒 فحص صلاحيات الدخول للداشبورد:", user);

  // 2. التحقق من وجود المستخدم وأن صلاحيته ليست "customer"
  // (نسمح فقط لـ owner أو admin)
  if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
    console.log("🚫 تم رفض الدخول! المستخدم ليس لديه صلاحية. جاري الإرجاع للرئيسية...");
    // طرد المستخدم وإعادته للصفحة الرئيسية
    return <Navigate to="/" replace />;
  }

  console.log("✅ تم السماح بالدخول للداشبورد");
  // 3. السماح بمرور المستخدم إذا كانت صلاحيته صحيحة
  return <Outlet />;
};

export default AdminRoute;