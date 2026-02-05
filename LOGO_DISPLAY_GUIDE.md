# Organization Logo Display Guide

## 📍 Where Organization Logos Appear

### 1. **Hackathon Creation Form**
- Logo upload field with live preview
- Preview shows in rounded container during upload
- File validation (max 5MB, images only)

### 2. **Organizer Dashboard Header** (Future Enhancement)
```tsx
// Add to navbar component
<div className="flex items-center gap-3">
  {organizationLogo && (
    <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 overflow-hidden">
      <img src={organizationLogo} alt="Org Logo" className="w-full h-full object-cover" />
    </div>
  )}
  <div>
    <p className="text-sm font-medium">{organizerName}</p>
    <p className="text-xs text-gray-400">{organizationType}</p>
  </div>
</div>
```

### 3. **Hackathon Cards** (Browse Page)
```tsx
// Add to hackathon card component
<div className="relative">
  {hackathon.organizationLogo && (
    <div className="absolute top-4 right-4 w-16 h-16 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm overflow-hidden">
      <img 
        src={hackathon.organizationLogo} 
        alt={hackathon.organizationType} 
        className="w-full h-full object-cover"
      />
    </div>
  )}
  {/* Rest of card content */}
</div>
```

### 4. **Hackathon Details Page**
```tsx
// Add to hackathon details header
<div className="flex items-start gap-6">
  {hackathon.organizationLogo && (
    <div className="w-24 h-24 rounded-2xl bg-white/10 border-2 border-white/20 shadow-lg overflow-hidden flex-shrink-0">
      <img 
        src={hackathon.organizationLogo} 
        alt={hackathon.organizationType} 
        className="w-full h-full object-cover"
      />
    </div>
  )}
  <div>
    <h1 className="text-4xl font-bold">{hackathon.title}</h1>
    <div className="flex items-center gap-2 mt-2">
      <Badge>{hackathon.organizationType}</Badge>
      <span className="text-gray-400">by {hackathon.organizer}</span>
    </div>
  </div>
</div>
```

## 🎨 Logo Container Styles

### Small (Navbar/List)
```tsx
className="w-10 h-10 rounded-lg bg-white/10 border border-white/20"
```

### Medium (Cards)
```tsx
className="w-16 h-16 rounded-xl bg-white/10 border border-white/20"
```

### Large (Details Page)
```tsx
className="w-24 h-24 rounded-2xl bg-white/10 border-2 border-white/20 shadow-lg"
```

### Extra Large (Hero Section)
```tsx
className="w-32 h-32 rounded-3xl bg-white/10 border-2 border-white/20 shadow-2xl"
```

## 🎯 Logo Upload Component

### In Create Hackathon Dialog

```tsx
<div className="space-y-2 md:col-span-2">
  <Label htmlFor="organizationLogo">Organization Logo</Label>
  <div className="flex items-center gap-4">
    <Input
      id="organizationLogo"
      type="file"
      accept="image/*"
      onChange={(e) => {
        const file = e.target.files?.[0]
        if (file) {
          if (!file.type.startsWith("image/")) {
            addToast("error", "Only image files are allowed")
            return
          }
          if (file.size > 5 * 1024 * 1024) {
            addToast("error", "File size must be less than 5MB")
            return
          }
          handleChange("organizationLogoFile", file)
        }
      }}
      className="cursor-pointer"
    />
    {form.organizationLogoFile && (
      <div className="flex items-center gap-2">
        <div className="w-16 h-16 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
          <img 
            src={URL.createObjectURL(form.organizationLogoFile)} 
            alt="Logo preview" 
            className="w-full h-full object-cover"
          />
        </div>
        <span className="text-xs text-green-600 font-medium">
          ✓ {form.organizationLogoFile.name}
        </span>
      </div>
    )}
  </div>
  <p className="text-xs text-muted-foreground">
    Upload your organization logo (max 5MB). Will be displayed on hackathon page.
  </p>
</div>
```

## 📤 Logo Upload to Supabase Storage

### Storage Bucket Setup

1. Create a bucket in Supabase Storage:
   - Name: `organization-logos`
   - Public: Yes
   - File size limit: 5MB
   - Allowed MIME types: `image/*`

2. Set up RLS policies:
```sql
-- Allow organizers to upload
CREATE POLICY "Organizers can upload logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'organization-logos' AND
  auth.uid() IN (SELECT id FROM users WHERE role = 'organizer')
);

-- Allow public read access
CREATE POLICY "Public can view logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'organization-logos');
```

### Upload Function

```typescript
async function uploadOrganizationLogo(file: File, hackathonId: string) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${hackathonId}-${Date.now()}.${fileExt}`
  const filePath = `${fileName}`

  const { data, error } = await supabase.storage
    .from('organization-logos')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from('organization-logos')
    .getPublicUrl(filePath)

  return publicUrl
}
```

### Integration in Create Hackathon API

```typescript
// After creating hackathon
if (form.organizationLogoFile) {
  const logoUrl = await uploadOrganizationLogo(
    form.organizationLogoFile, 
    hackathonId
  )
  
  // Update hackathon with logo URL
  await supabase
    .from('hackathons')
    .update({ organization_logo: logoUrl })
    .eq('id', hackathonId)
}
```

## 🎨 Visual Examples

### Logo in Card (Glassmorphism Effect)
```tsx
<div className="relative p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 backdrop-blur-sm">
  {/* Logo Badge */}
  <div className="absolute -top-3 -right-3 w-20 h-20 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md overflow-hidden shadow-xl">
    <img src={logo} alt="Logo" className="w-full h-full object-cover" />
  </div>
  
  {/* Card Content */}
  <h3 className="text-xl font-bold">Hackathon Title</h3>
  <p className="text-gray-400 mt-2">Description...</p>
</div>
```

### Logo with Glow Effect
```tsx
<div className="relative">
  <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
  <div className="relative w-24 h-24 rounded-2xl bg-white/10 border-2 border-white/20 overflow-hidden">
    <img src={logo} alt="Logo" className="w-full h-full object-cover" />
  </div>
</div>
```

### Logo with Organization Type Badge
```tsx
<div className="flex items-center gap-3">
  <div className="w-16 h-16 rounded-xl bg-white/10 border border-white/20 overflow-hidden">
    <img src={logo} alt="Logo" className="w-full h-full object-cover" />
  </div>
  <div>
    <p className="font-semibold text-white">Organization Name</p>
    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
      {organizationType}
    </Badge>
  </div>
</div>
```

## 🎯 Best Practices

### Logo Image Guidelines
1. **Format:** PNG with transparent background preferred
2. **Size:** 400x400px to 800x800px
3. **Aspect Ratio:** 1:1 (square)
4. **File Size:** Under 500KB recommended
5. **Content:** Clear, recognizable at small sizes

### Fallback Handling
```tsx
{organizationLogo ? (
  <img src={organizationLogo} alt="Logo" className="w-full h-full object-cover" />
) : (
  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500">
    <span className="text-2xl font-bold text-white">
      {organizationType.charAt(0)}
    </span>
  </div>
)}
```

### Error Handling
```tsx
<img 
  src={organizationLogo} 
  alt="Logo"
  onError={(e) => {
    e.currentTarget.src = '/default-org-logo.png'
  }}
  className="w-full h-full object-cover"
/>
```

---

**Implementation Status:** ✅ Logo upload field added to create hackathon form
**Next Steps:** Integrate logo display in hackathon cards and details pages
