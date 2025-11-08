# How to Add Images to Your Website

## Quick Start: Adding Images Right Now

### Step 1: Create Images Folder

```bash
mkdir /home/user/IWDOGS/images
```

### Step 2: Add Your Image Files

Copy your Irish Wolfhound photos to the `/images` folder:

```
IWDOGS/
├── index.html
├── styles.css
├── script.js
└── images/
    ├── hero-wolfhound.jpg
    ├── about-team.jpg
    ├── dog-1.jpg
    ├── dog-2.jpg
    ├── dog-3.jpg
    └── logo.png
```

### Step 3: Update HTML to Use Images

Replace placeholder divs with actual `<img>` tags:

#### Example: Hero Image

**Current placeholder:**
```html
<div class="image-placeholder">Irish Wolfhound Image</div>
```

**Replace with:**
```html
<img src="images/hero-wolfhound.jpg"
     alt="Beautiful Irish Wolfhound standing in field"
     loading="lazy">
```

#### Example: Dog Cards

**Current:**
```html
<div class="image-placeholder">Dog Image 1</div>
```

**Replace with:**
```html
<img src="images/dog-1.jpg"
     alt="Champion Sire - [Dog's Name]"
     loading="lazy">
```

---

## Image Specifications

### Recommended Sizes:

1. **Hero Image:** 1920x1080px (landscape)
2. **About Section:** 800x600px
3. **Dog Cards:** 600x600px (square)
4. **Logo:** 300x300px (PNG with transparency)

### File Formats:

- **JPEG/JPG:** For photos (smaller file size)
- **PNG:** For logos with transparency
- **WebP:** Modern format (best quality + size) - optional

### Optimization:

Before uploading, compress images:
- Use: TinyPNG.com or Squoosh.app
- Target: Under 300KB per image
- Maintains quality while reducing load time

---

## Full HTML Updates Needed

Here are all the places to add images:

### 1. Hero Section (Line ~87)
```html
<div class="hero-image-placeholder">
    <img src="images/hero-wolfhound.jpg"
         alt="Majestic Irish Wolfhound representing Mount Olympus Kennel"
         loading="lazy"
         width="800"
         height="600">
</div>
```

### 2. About Section (Line ~114)
```html
<div class="about-image-placeholder">
    <img src="images/about-team.jpg"
         alt="Mother-daughter team with their Irish Wolfhounds"
         loading="lazy"
         width="800"
         height="600">
</div>
```

### 3. Dog Cards (Lines ~128-140)

**Dog Card 1:**
```html
<div class="dog-card">
    <img src="images/sire-champion.jpg"
         alt="Champion Sire [Dog's Name]"
         loading="lazy"
         width="600"
         height="600">
    <h3>Champion Sire</h3>
    <p>Information about breeding male</p>
</div>
```

**Dog Card 2:**
```html
<div class="dog-card">
    <img src="images/dam-champion.jpg"
         alt="Champion Dam [Dog's Name]"
         loading="lazy"
         width="600"
         height="600">
    <h3>Champion Dam</h3>
    <p>Information about breeding female</p>
</div>
```

**Dog Card 3:**
```html
<div class="dog-card">
    <img src="images/show-dog.jpg"
         alt="Show Dog [Dog's Name]"
         loading="lazy"
         width="600"
         height="600">
    <h3>Show Dog</h3>
    <p>Information about show achievements</p>
</div>
```

---

## Optional: Add Logo to Header

In the header section (around line 54):

```html
<div class="logo">
    <img src="images/logo.png"
         alt="Mount Olympus Irish Wolfhounds Logo"
         height="60">
    <h1>Mount Olympus Irish Wolfhounds</h1>
</div>
```

Then add CSS for logo:
```css
.logo {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.logo img {
    height: 60px;
    width: auto;
}
```

---

## CSS Adjustments for Images

The current `.image-placeholder` divs have styling. Once you add real images, you may want to update CSS:

### Remove placeholder styles when images are added:

In `styles.css`, you can either:
1. Keep the placeholder class for future use
2. Or remove it entirely

### Add image-specific styling:

```css
/* Dog card images */
.dog-card img {
    width: 100%;
    height: 300px;
    object-fit: cover;
    object-position: center;
}

/* Hero section images */
.hero-image-placeholder img {
    width: 100%;
    height: auto;
    border-radius: 8px;
    box-shadow: 0 8px 16px var(--shadow);
}

/* About section images */
.about-image-placeholder img {
    width: 100%;
    height: auto;
    border-radius: 8px;
}
```

---

## Using CDN for Images (Advanced)

If you want faster loading and automatic optimization:

### Option 1: Cloudinary (Recommended)
1. Sign up at cloudinary.com (FREE)
2. Upload images
3. Use their URLs:

```html
<img src="https://res.cloudinary.com/YOUR_CLOUD/image/upload/v1234/hero-wolfhound.jpg"
     alt="Irish Wolfhound">
```

Benefits:
- Automatic image optimization
- Responsive images
- Fast CDN delivery
- FREE tier: 25GB storage

### Option 2: ImgIx
- Similar to Cloudinary
- Excellent image processing
- Free tier available

---

## Responsive Images (Best Practice)

For even better performance, use srcset:

```html
<img src="images/hero-wolfhound.jpg"
     srcset="images/hero-wolfhound-400.jpg 400w,
             images/hero-wolfhound-800.jpg 800w,
             images/hero-wolfhound-1200.jpg 1200w"
     sizes="(max-width: 600px) 400px,
            (max-width: 1200px) 800px,
            1200px"
     alt="Irish Wolfhound"
     loading="lazy">
```

This serves different sized images based on screen size.

---

## Image Attribution & Alt Text Best Practices

### Good alt text examples:
- ✅ "Champion Irish Wolfhound Zeus at Westminster Dog Show"
- ✅ "Mother-daughter breeding team with their wolfhounds in Washoe Valley"
- ✅ "Three-month-old wheaten Irish Wolfhound puppies playing"

### Bad alt text examples:
- ❌ "dog"
- ❌ "image1"
- ❌ "DSC_1234.jpg"

Good alt text helps:
- Screen readers (accessibility)
- SEO (search engines)
- Shows when image fails to load

---

## Quick Implementation Checklist

- [ ] Create `/images` folder
- [ ] Add optimized image files
- [ ] Update hero section image
- [ ] Update about section image
- [ ] Update all 3 dog card images
- [ ] Add proper alt text to all images
- [ ] Test on mobile (responsive)
- [ ] Verify images load correctly
- [ ] Check page load speed

---

## Need Help?

Let me know if you want me to:
1. Update the HTML with image tags (just provide image filenames)
2. Add CSS for image optimization
3. Set up Cloudinary integration
4. Create responsive image code
