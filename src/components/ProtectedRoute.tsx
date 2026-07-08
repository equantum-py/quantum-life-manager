import { Navigate, Outlet, useParams } from 'react-router-dom';import { authService } from '../services/authService';
export function ProtectedRoute(){const user=authService.current();const {sectionId}=useParams();if(!user)return <Navigate to="/login" replace/>;if(sectionId&&!user.sections.includes(sectionId as never))return <Navigate to="/sections" replace/>;return <Outlet/>}
