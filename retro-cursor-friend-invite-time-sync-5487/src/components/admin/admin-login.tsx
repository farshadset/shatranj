'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MenuItem, Category, NavbarStyle, TemplateType, TemplateConfig, DessertsSectionConfig } from '@/types/menu'
import { LogIn, LogOut, Settings, X, Palette, Menu, Lock, Info, User, Layout, Grid, Square, Trash2 } from 'lucide-react'
import { ThemeEditor } from './theme-editor'
import { cn } from '@/lib/utils'
import { useMenuData } from '@/contexts/MenuDataContext'

// Template configurations
const templates: TemplateConfig[] = [
  {
    id: 'default',
    name: 'قالب عریض',
    description: '',
    icon: '📄',
    className: 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
  },
  {
    id: 'compact',
    name: 'قالب فشرده',
    description: '',
    icon: '📊',
    className: 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
  },
  {
    id: 'square',
    name: 'قالب سریع',
    description: '',
    icon: '⬛',
    className: 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200'
  }
]

const getTemplateIcon = (templateId: TemplateType) => {
  switch (templateId) {
    case 'default':
      return <Layout className="w-5 h-5" />
    case 'compact':
      return <Grid className="w-5 h-5" />
    case 'square':
      return <Square className="w-5 h-5" />
    default:
      return <Layout className="w-5 h-5" />
  }
}

interface AdminLoginProps {
  onLogin: (isAdmin: boolean) => void
  isLoggedIn: boolean
  onLogout: () => void
  onUpdateMenuItem: (id: number, newTitle: string, newDescription: string, newImage: string) => void
  onUpdateCategories: (categories: Category[]) => void
  onUpdateItems: (items: MenuItem[]) => void
  onNavbarStyleChange?: (style: NavbarStyle) => void
  onTemplateChange?: (template: TemplateType) => void
  onDessertsConfigChange?: (config: DessertsSectionConfig) => void
}

export function AdminLogin({ 
  onLogin, 
  isLoggedIn, 
  onLogout, 
  onUpdateMenuItem, 
  onUpdateCategories, 
  onUpdateItems, 
  onNavbarStyleChange, 
  onTemplateChange,
  onDessertsConfigChange
}: AdminLoginProps) {
  const { 
    menuItems, 
    categories, 
    navbarStyle, 
    selectedTemplate, 
    dessertsConfig, 
    hasUnsavedChanges, 
    confirmChanges, 
    cancelChanges 
  } = useMenuData()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editImage, setEditImage] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageError, setImageError] = useState('')
  const [showThemeEditor, setShowThemeEditor] = useState(false)

  const [showAboutModal, setShowAboutModal] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [originalTemplate, setOriginalTemplate] = useState<TemplateType | null>(null)

  // Load saved credentials from localStorage on component mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('admin_username')
    const savedPassword = localStorage.getItem('admin_password')
    const savedRememberMe = localStorage.getItem('admin_remember_me')
    
    if (savedUsername && savedPassword && savedRememberMe === 'true') {
      setUsername(savedUsername)
      setPassword(savedPassword)
      setRememberMe(true)
    }
  }, [])

  // Save credentials to localStorage
  const saveCredentials = (username: string, password: string) => {
    if (rememberMe) {
      localStorage.setItem('admin_username', username)
      localStorage.setItem('admin_password', password)
      localStorage.setItem('admin_remember_me', 'true')
    } else {
      // Clear saved credentials if remember me is unchecked
      localStorage.removeItem('admin_username')
      localStorage.removeItem('admin_password')
      localStorage.setItem('admin_remember_me', 'false')
    }
  }

  // Clear saved credentials
  const clearSavedCredentials = () => {
    localStorage.removeItem('admin_username')
    localStorage.removeItem('admin_password')
    localStorage.removeItem('admin_remember_me')
    setUsername('')
    setPassword('')
    setRememberMe(false)
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (username === 'retro' && password === 'majid') {
      // Save credentials if remember me is checked
      saveCredentials(username, password)
      
      onLogin(true)
      setShowLoginModal(false)
      setError('')
    } else {
      setError('نام کاربری یا رمز عبور اشتباه است')
    }
  }

  const handleLogout = () => {
    onLogout()
    setShowAdminPanel(false)
    setShowHamburgerMenu(false)
    setEditingItem(null)
  }

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item)
    setEditTitle(item.title)
    setEditDescription(item.description)
    setEditImage(item.image)
    setImagePreview(null)
    setImageError('')
    setShowAdminPanel(true)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 2MB for website optimization)
    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      setImageError('حجم فایل نباید بیشتر از 2 مگابایت باشد')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setImageError('فقط فایل‌های تصویری مجاز هستند')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
      setEditImage(e.target?.result as string)
      setImageError('')
    }
    reader.readAsDataURL(file)
  }

  const handleSaveEdit = () => {
    if (editingItem) {
      onUpdateMenuItem(editingItem.id, editTitle, editDescription, editImage)
      setEditingItem(null)
      setEditTitle('')
      setEditDescription('')
      setEditImage('')
      setImagePreview(null)
      setImageError('')
    }
  }

  const handleCancelEdit = () => {
    setEditingItem(null)
    setEditTitle('')
    setEditDescription('')
    setEditImage('')
    setImagePreview(null)
    setImageError('')
  }

  const handleHamburgerMenuClick = () => {
    setShowHamburgerMenu(!showHamburgerMenu)
    setShowAdminPanel(false)
  }

  const handleThemeEditorClick = () => {
    setShowThemeEditor(true)
    setShowHamburgerMenu(false)
  }



  const handleAboutClick = () => {
    setShowAboutModal(true)
    setShowHamburgerMenu(false)
  }

  const handleTemplateClick = () => {
    setOriginalTemplate(selectedTemplate) // Store the current template as original
    setShowTemplateModal(true)
    setShowHamburgerMenu(false)
  }

  return (
    <>
      {/* Hamburger Menu Button - Always Visible */}
      <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleHamburgerMenuClick}
          className="group p-2 text-primary-foreground/80 hover:text-primary-foreground hover:bg-background/20 rounded-xl transition-all duration-300 ease-in-out hover:scale-110 active:scale-95"
          title="منو"
        >
          <div className="relative">
            {/* Animated Hamburger Icon */}
            <div className="flex flex-col justify-center items-center w-6 h-6">
              <span className={`bg-current block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${
                showHamburgerMenu ? 'rotate-45 translate-y-1' : '-translate-y-0.5'
              }`}></span>
              <span className={`bg-current block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${
                showHamburgerMenu ? 'opacity-0' : 'opacity-100'
              }`}></span>
              <span className={`bg-current block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${
                showHamburgerMenu ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'
              }`}></span>
            </div>
          </div>
        </Button>
        
                 {/* Admin Panel Dropdown - Rendered in Portal */}
         {typeof document !== 'undefined' && showAdminPanel && createPortal(
           <>
             {/* Backdrop overlay */}
             <div 
               className="modal-overlay bg-black/20 backdrop-blur-sm z-[999998]" 
               style={{ zIndex: 999998 }}
               onClick={() => setShowAdminPanel(false)}
             />
             <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4" style={{ zIndex: 999999, position: 'fixed' }}>
               <Card className="modal-content w-96 max-h-96 overflow-y-auto bg-card/95 backdrop-blur-md border border-border shadow-xl relative z-[999999]" style={{ zIndex: 999999 }}>
              <CardHeader>
                <CardTitle className="text-center text-lg">پنل ادمین</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground text-center">
                    آیتم‌های منو
                  </p>
                  {menuItems.map((item) => (
                    <div key={item.id} className="border border-border rounded-lg p-3 bg-background/50">
                      {editingItem?.id === item.id ? (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                              نام آیتم
                            </label>
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                              توضیحات
                            </label>
                            <textarea
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              rows={2}
                              className="w-full px-2 py-1 text-sm border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                              تصویر
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="block w-full text-sm text-foreground border border-border rounded-lg cursor-pointer bg-background file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                            />
                            {imagePreview && (
                              <div className="mt-2">
                                <img src={imagePreview} alt="Preview" className="max-w-full h-auto rounded-md" />
                              </div>
                            )}
                            {imageError && (
                              <p className="text-red-500 text-sm mt-2">{imageError}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleSaveEdit} className="flex-1">
                              ذخیره
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleCancelEdit} className="flex-1">
                              لغو
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h4 className="font-medium text-foreground mb-1">{item.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                          <p className="text-sm text-muted-foreground">قیمت: {item.price.toLocaleString('en-US').replace(/,/g, '.')} تومان</p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditItem(item)}
                            className="w-full"
                          >
                            ویرایش
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                                 </div>
               </CardContent>
             </Card>
               </div>
             </>,
           document.body
         )}

        {/* Enhanced Hamburger Menu Dropdown */}
        {typeof document !== 'undefined' && showHamburgerMenu && createPortal(
          <>
            {/* Backdrop overlay for closing menu */}
            <div 
              className="fixed inset-0 z-[999998] bg-transparent"
              onClick={() => setShowHamburgerMenu(false)}
            />
            <div className="fixed top-16 right-4 z-[999999] bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-2xl p-2 min-w-52 animate-in slide-in-from-top-2 duration-300">
            <div className="space-y-1">
              {/* Login/Logout Section */}
              {!isLoggedIn ? (
                <button
                  onClick={() => {
                    setShowLoginModal(true)
                    setShowHamburgerMenu(false)
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-background/60 rounded-lg transition-all duration-200 hover:scale-[1.02] group"
                >
                  <div className="p-1 bg-primary/10 rounded-md group-hover:bg-primary/20 transition-colors">
                    <LogIn size={16} className="text-primary" />
                  </div>
                  <span className="font-medium">ورود ادمین</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-[1.02] group"
                  >
                    <div className="p-1 bg-red-500/10 rounded-md group-hover:bg-red-500/20 transition-colors">
                      <LogOut size={16} className="text-red-600" />
                    </div>
                    <span className="font-medium text-red-600">خروج</span>
                  </button>
                  
                  {/* Divider */}
                  <div className="h-px bg-border my-2"></div>
                  
                  {/* Action Buttons - Only show when there are unsaved changes */}
                  {hasUnsavedChanges && (
                    <>
                      <button
                        onClick={confirmChanges}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-green-50 rounded-lg transition-all duration-200 hover:scale-[1.02] group border border-green-200"
                      >
                        <div className="p-1 bg-green-500/10 rounded-md group-hover:bg-green-500/20 transition-colors">
                          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        </div>
                        <span className="font-medium text-green-700">تایید تغییرات</span>
                      </button>
                      
                      <button
                        onClick={cancelChanges}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-[1.02] group border border-red-200"
                      >
                        <div className="p-1 bg-red-500/10 rounded-md group-hover:bg-red-500/20 transition-colors">
                          <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✕</span>
                          </div>
                        </div>
                        <span className="font-medium text-red-700">لغو تغییرات</span>
                      </button>
                      
                      {/* Divider */}
                      <div className="h-px bg-border my-2"></div>
                    </>
                  )}
                  
              <button
                onClick={handleThemeEditorClick}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-background/60 rounded-lg transition-all duration-200 hover:scale-[1.02] group"
                  >
                    <div className="p-1 bg-primary/10 rounded-md group-hover:bg-primary/20 transition-colors">
                      <Palette size={16} className="text-primary" />
                    </div>
                    <span className="font-medium">ویرایش تم</span>
              </button>
                </>
              )}
              
              {/* Divider */}
              <div className="h-px bg-border my-2"></div>
              
              {/* Templates Section - Only show for admin users */}
              {isLoggedIn && (
                <button
                  onClick={handleTemplateClick}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-background/60 rounded-lg transition-all duration-200 hover:scale-[1.02] group"
                >
                  <div className="p-1 bg-green-500/10 rounded-md group-hover:bg-green-500/20 transition-colors">
                    <Layout size={16} className="text-green-600" />
                  </div>
                  <span className="font-medium">قالب‌ها</span>
                </button>
              )}
              
              {/* About Section */}
              <button
                onClick={handleAboutClick}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-background/60 rounded-lg transition-all duration-200 hover:scale-[1.02] group"
              >
                <div className="p-1 bg-blue-500/10 rounded-md group-hover:bg-blue-500/20 transition-colors">
                  <Info size={16} className="text-blue-600" />
                </div>
                <span className="font-medium">درباره ما</span>
              </button>
              
              {/* Divider */}
              <div className="h-px bg-border my-2"></div>
              
              {/* Forget Admin Info Button - Last Item */}
              <button
                onClick={() => {
                  clearSavedCredentials()
                  setShowHamburgerMenu(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-orange-50 rounded-lg transition-all duration-200 hover:scale-[1.02] group"
              >
                <div className="p-1 bg-orange-500/10 rounded-md group-hover:bg-orange-500/20 transition-colors">
                  <Trash2 size={16} className="text-orange-600" />
                </div>
                <span className="font-medium text-orange-600">فراموش کردن اطلاعات مدیر</span>
              </button>
            </div>
          </div>
          </>,
          document.body
        )}
      </div>

                    {/* Centered Login Modal - Rendered in Portal */}
       {typeof document !== 'undefined' && showLoginModal && createPortal(
         <div className="modal-overlay bg-black/50 backdrop-blur-sm z-[999999] flex items-center justify-center p-4" style={{ zIndex: 999999, position: 'fixed' }}>
           <Card className="modal-content w-80 bg-card/95 backdrop-blur-md border border-border shadow-2xl relative z-[999999]" style={{ zIndex: 999999 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLoginModal(false)}
              className="absolute top-2 right-2 p-1 h-8 w-8 text-foreground/70 hover:text-foreground"
            >
              <X size={16} />
            </Button>
            <CardHeader>
              <CardTitle className="text-center text-lg">ورود ادمین</CardTitle>

            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    نام کاربری
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    رمز عبور
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                
                {/* Remember Me Checkbox */}
                <div className="flex items-center space-x-2 space-x-reverse">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
                  />
                  <label htmlFor="rememberMe" className="text-sm text-foreground">
                    به خاطر سپردن
                  </label>
                </div>

                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}
                <Button type="submit" className="w-full">
                  ورود
                </Button>
              </form>
              
            </CardContent>
          </Card>
        </div>,
        document.body
      )}

      {/* Theme Editor */}
      <ThemeEditor 
        isOpen={showThemeEditor} 
        onClose={() => setShowThemeEditor(false)}
        onUpdateCategories={onUpdateCategories}
        onUpdateItems={onUpdateItems}
        onNavbarStyleChange={onNavbarStyleChange}
        onDessertsConfigChange={onDessertsConfigChange}
      />



      {/* Template Selection Modal */}
      {typeof document !== 'undefined' && showTemplateModal && createPortal(
        <div className="modal-overlay bg-black/50 backdrop-blur-sm z-[999999] flex items-center justify-center p-4" style={{ zIndex: 999999, position: 'fixed' }}>
          <Card className="modal-content w-full max-w-4xl bg-card/95 backdrop-blur-md border border-border shadow-2xl relative z-[999999]" style={{ zIndex: 999999 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTemplateModal(false)}
              className="absolute top-2 right-2 p-1 h-8 w-8 text-foreground/70 hover:text-foreground z-10"
            >
              <X size={16} />
            </Button>
            
            {/* Template Change Confirmation Buttons - Only show when there's a change */}
            {originalTemplate && selectedTemplate !== originalTemplate && (
              <div className="absolute top-2 left-2 flex items-center space-x-2 z-10">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    // Confirm template change - save to localStorage
                    confirmChanges()
                    setShowTemplateModal(false)
                    setOriginalTemplate(null) // Clear the original template
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-4"
                >
                  تأیید تغییرات
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Cancel template change - revert to original
                    if (originalTemplate) {
                      onTemplateChange?.(originalTemplate)
                    }
                    cancelChanges() // Revert any other pending changes
                    setShowTemplateModal(false)
                    setOriginalTemplate(null) // Clear the original template
                  }}
                  className="border-red-500 text-red-600 hover:bg-red-50 px-4"
                >
                  لغو تغییرات
                </Button>
              </div>
            )}
            
            <CardHeader>
              <CardTitle className="text-center text-xl">انتخاب قالب نمایش</CardTitle>
              <p className="text-center text-muted-foreground">قالب مورد نظر خود را انتخاب کنید</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <Card
                    key={template.id}
                    className={cn(
                      "p-4 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg border-2",
                      template.className,
                      selectedTemplate === template.id && "ring-2 ring-primary ring-offset-2 scale-105 shadow-xl"
                    )}
                    onClick={() => {
                      onTemplateChange?.(template.id)
                      // Don't close modal immediately - wait for confirmation
                    }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={cn(
                        "p-3 rounded-lg transition-colors",
                        selectedTemplate === template.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      )}>
                        {getTemplateIcon(template.id)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground text-right text-lg">{template.name}</h3>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground text-right leading-relaxed mb-4">
                      {template.description}
                    </p>
                    
                    {selectedTemplate === template.id && (
                      <div className="pt-3 border-t border-current/20 text-center">
                        <span className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                          <span>✓</span>
                          <span>قالب فعال</span>
                        </span>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <Button 
                  onClick={() => setShowTemplateModal(false)} 
                  variant="outline"
                  className="min-w-32"
                >
                  بستن
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>,
        document.body
      )}

      {/* About Modal */}
      {typeof document !== 'undefined' && showAboutModal && createPortal(
        <div className="modal-overlay bg-black/50 backdrop-blur-sm z-[999999] flex items-center justify-center p-4" style={{ zIndex: 999999, position: 'fixed' }}>
          <Card className="modal-content w-80 bg-card/95 backdrop-blur-md border border-border shadow-2xl relative z-[999999]" style={{ zIndex: 999999 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAboutModal(false)}
              className="absolute top-2 right-2 p-1 h-8 w-8 text-foreground/70 hover:text-foreground"
            >
              <X size={16} />
            </Button>
            <CardHeader>
              <CardTitle className="text-center text-lg">درباره ما</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  منوی دیجیتال رترو
                </p>
                <p className="text-sm text-muted-foreground text-center">
                  نسخه 1.0.0
                </p>
                <Button 
                  onClick={() => setShowAboutModal(false)} 
                  className="w-full"
                >
                  بستن
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>,
        document.body
      )}
    </>
  )
}
