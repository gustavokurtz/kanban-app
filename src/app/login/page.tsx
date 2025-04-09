'use client'

import * as React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { LogIn, Mail, Lock, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

// Interface para os dados enviados no login
interface UserLogin {
  email: string;
  password: string;
}

// Interface para a resposta recebida do backend
interface LoginResponse {
  access_token: string;
}

async function loginUser(user: UserLogin): Promise<LoginResponse> {
  const response = await fetch('https://nestauth-api-production.up.railway.app/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  });
  
  if (!response.ok) {
    throw new Error(`Credenciais inválidas`);
  }
  
  return await response.json();
}


export default function Login() {
  // Estados para o formulário
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  
  // Router para navegação
  const router = useRouter()

  // Verificar se já existe um token salvo
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    
    if (token) {
      // Se o token existir, redirecionar para a página de tarefas
      router.push('/tasks');
    }
  }, [router]);

  // Função para lidar com o envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validações básicas
    if (!email.trim()) {
      toast.error("Por favor, insira seu email")
      return
    }
    
    if (!password.trim()) {
      toast.error("Por favor, insira sua senha")
      return
    }
    
    // Iniciar processo de login
    setLoading(true)
    
    try {
      const userDto: UserLogin = {
        email: email,
        password: password
      };
      
      const response = await loginUser(userDto);
      
      // Salvar o token JWT no localStorage
      localStorage.setItem('authToken', response.access_token);
      
      toast.success("Login realizado com sucesso!");
      
      // Redirecionar para página de tarefas
      setTimeout(() => {
        router.push('/tasks');
      }, 1000);
          
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      toast.error(error.message || "Credenciais inválidas");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-purple-800 text-white p-4 md:p-6 flex items-center justify-center">
      {/* Toast Container */}
      <Toaster richColors closeButton position="top-right" />
      
      <div className="w-full max-w-md">
        {/* Card de login com efeito de vidro */}
        <div className="backdrop-blur-md bg-white/10 rounded-xl p-8 shadow-lg border border-indigo-700/30">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-200 to-purple-100">
              Login
            </h1>
            <p className="text-violet-300 mt-2">
              Entre para acessar suas tarefas diárias
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo de email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-violet-300">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-violet-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full pl-10 px-3 py-2 bg-indigo-900/40 border border-indigo-700/50 rounded-lg text-white placeholder:text-violet-300/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            
            {/* Campo de senha */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-violet-300">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-violet-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="block w-full pl-10 pr-10 px-3 py-2 bg-indigo-900/40 border border-indigo-700/50 rounded-lg text-white placeholder:text-violet-300/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    className="text-violet-400 hover:text-violet-300 focus:outline-none"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Botão de login */}
            <div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:opacity-90 text-white transition-all duration-300 border-0 rounded-lg shadow-lg hover:shadow-violet-500/20 flex items-center justify-center gap-2 py-6"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    <span>Entrar</span>
                  </>
                )}
              </Button>
            </div>
            
            {/* Link para recuperação de senha */}
            <div className="text-center">
              <a 
                href="#" 
                className="text-sm text-violet-300 hover:text-white transition-colors"
              >
                Esqueceu sua senha?
              </a>
            </div>
          </form>
          
          {/* Link para registro */}
          <div className="mt-6 pt-6 border-t border-indigo-700/30 text-center">
            <p className="text-violet-300">
              Não tem uma conta?{" "}
              <Link href="/register" className="text-white hover:text-violet-200 font-medium">
                Registre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}