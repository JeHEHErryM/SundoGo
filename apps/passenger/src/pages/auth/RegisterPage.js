import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { UserPlus, Mail, Lock, Phone, User, Eye, EyeOff, Car } from "lucide-react";
export default function RegisterPage() {
    const navigate = useNavigate();
    const register = useAuthStore((s) => s.register);
    const isLoading = useAuthStore((s) => s.isLoading);
    const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await register(form);
            navigate("/");
        }
        catch {
            setError("Registration failed. Please try again.");
        }
    };
    const fields = [
        { key: "name", label: "Full Name", type: "text", placeholder: "Juan Dela Cruz", icon: User },
        { key: "email", label: "Email", type: "email", placeholder: "you@example.com", icon: Mail },
        { key: "phone", label: "Phone Number", type: "tel", placeholder: "+63 9XX XXX XXXX", icon: Phone },
    ];
    return (_jsxs("div", { className: "min-h-dvh flex flex-col bg-white", children: [_jsx("div", { className: "flex-1 flex flex-col justify-center px-6 py-12", children: _jsxs("div", { className: "max-w-sm mx-auto w-full", children: [_jsx("div", { className: "flex items-center justify-center mb-8", children: _jsx("div", { className: "w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/25", children: _jsx(Car, { size: 32, className: "text-white" }) }) }), _jsx("h1", { className: "text-2xl font-bold text-center text-slate-900 mb-1", children: "Create account" }), _jsx("p", { className: "text-center text-slate-500 text-sm mb-8", children: "Join SundoGo and start riding" }), error && (_jsx("div", { className: "mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm", children: error })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [fields.map(({ key, label, type, placeholder, icon: Icon }) => (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1.5", children: label }), _jsxs("div", { className: "relative", children: [_jsx(Icon, { size: 18, className: "absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" }), _jsx("input", { type: type, required: true, value: form[key], onChange: (e) => handleChange(key, e.target.value), placeholder: placeholder, className: "w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:bg-white focus:border-blue-500 transition-colors" })] })] }, key))), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1.5", children: "Password" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { size: 18, className: "absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" }), _jsx("input", { type: showPassword ? "text" : "password", required: true, minLength: 8, value: form.password, onChange: (e) => handleChange("password", e.target.value), placeholder: "Min. 8 characters", className: "w-full h-12 pl-11 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:bg-white focus:border-blue-500 transition-colors" }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600", children: showPassword ? _jsx(EyeOff, { size: 18 }) : _jsx(Eye, { size: 18 }) })] })] }), _jsx("button", { type: "submit", disabled: isLoading, className: "w-full h-12 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-600/25", children: isLoading ? (_jsx("div", { className: "w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" })) : (_jsxs(_Fragment, { children: [_jsx(UserPlus, { size: 18 }), "Create Account"] })) })] })] }) }), _jsx("div", { className: "px-6 pb-8 text-center", children: _jsxs("p", { className: "text-sm text-slate-500", children: ["Already have an account?", " ", _jsx(Link, { to: "/login", className: "text-blue-600 font-semibold hover:text-blue-700", children: "Sign in" })] }) })] }));
}
