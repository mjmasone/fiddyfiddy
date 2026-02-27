# Phase 1 Implementation Guide

Tonight's changes: **Urgency Threshold**, **Logo Per Raffle**, **Color Presets**

---

## 1. Urgency Threshold (5 min)

### File: `app/r/[id]/page.js`

**Find this code** (around line 195-210):

```jsx
          {/* Urgency messaging */}
          {ticketsRemaining <= 20 && ticketsRemaining > 0 && (
            <p className="text-amber-400 text-sm mt-2 text-center animate-pulse">
              🔥 Only {ticketsRemaining} tickets left!
            </p>
          )}
          {ticketsRemaining > 20 && ticketsRemaining <= 50 && (
            <p className="text-secondary text-sm mt-2 text-center">
              ⚡ Selling fast — {ticketsRemaining} remaining
            </p>
          )}
```

**Replace with:**

```jsx
          {/* Urgency messaging - shows when 70%+ sold */}
          {(() => {
            const percentSold = ((raffle.tickets_sold || 0) / raffle.max_tickets) * 100;
            const threshold = 70; // Phase 2: pull from raffle.urgency_threshold
            if (percentSold >= threshold && ticketsRemaining > 0) {
              return (
                <p className="text-gray-300 text-sm mt-2 text-center">
                  🎟️ {ticketsRemaining} tickets remaining • Jackpot: ${jackpot}
                </p>
              );
            }
            return null;
          })()}
```

---

## 2. Logo Per Raffle (30 min)

### Step 2.1: Add Field to Knack

1. Go to **Knack → Builder → Objects → Raffles (object_6)**
2. Click **Add Field**
3. Settings:
   - **Name:** `Logo URL`
   - **Type:** Short Text
   - **Required:** No
4. Save and note the field ID (e.g., `field_123`)

### Step 2.2: Update lib/knack.js

Find the raffle field mappings and add:

```javascript
logo_url: 'field_123',  // Replace with your actual field ID
```

### Step 2.3: Update Create Raffle Form

**File:** `app/raffle/new/page.js`

**Add to initial form state** (find `useState` for formData):

```javascript
logo_url: '',
```

**Add form field** (after beneficiary fields, before ticket price):

```jsx
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Logo URL (Optional)
                </label>
                <input
                  type="url"
                  className="input"
                  placeholder="https://example.com/logo.png"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paste a link to your team/organization logo. Shows on raffle page and flyer.
                </p>
              </div>
```

**Add to handleSubmit body** (in the POST fetch body):

```javascript
logo_url: formData.logo_url || '',
```

### Step 2.4: Update Edit Raffle Form

**File:** `app/raffle/[id]/edit/page.js`

**Same changes as Step 2.3**, plus load existing value.

Find where raffle data is loaded and add:

```javascript
logo_url: data.logo_url || '',
```

### Step 2.5: Update Player Page (Already Done!)

The player page at `app/r/[id]/page.js` already has this code:

```jsx
{raffle.logo ? (
  <img src={raffle.logo} ... />
) : (
  <div>🎯</div>
)}
```

Just make sure the API returns `logo_url` as `logo` OR update this to use `raffle.logo_url`.

### Step 2.6: Update Flyer

**File:** `app/raffle/[id]/flyer/page.js`

Find the header section and add logo display:

```jsx
        {/* Charity / Beneficiary Name */}
        <div className="flyer-header">
          {raffle.logo_url && (
            <img 
              src={raffle.logo_url} 
              alt={charityName}
              className="flyer-logo"
            />
          )}
          <h1 className="flyer-charity-name">{charityName}</h1>
          <div className="flyer-divider"></div>
          <h2 className="flyer-subtitle">50/50 RAFFLE</h2>
        </div>
```

Add CSS in the style section:

```css
        .flyer-logo {
          width: 1.5in;
          height: 1.5in;
          object-fit: contain;
          margin: 0 auto 0.3in auto;
        }
```

---

## 3. Color Presets (45 min)

### Step 3.1: Add Field to Knack

1. Go to **Knack → Builder → Objects → Raffles (object_6)**
2. Click **Add Field**
3. Settings:
   - **Name:** `Theme Color`
   - **Type:** Short Text
   - **Required:** No
   - **Default:** `purple` (or leave blank)
4. Save and note the field ID (e.g., `field_124`)

### Step 3.2: Define Color Presets

Create a color map. You can put this in `lib/utils.js` or directly in the components:

```javascript
const COLOR_PRESETS = {
  purple: { primary: '#8B5CF6', name: 'Purple' },
  blue: { primary: '#3B82F6', name: 'Blue' },
  green: { primary: '#10B981', name: 'Green' },
  red: { primary: '#EF4444', name: 'Red' },
  orange: { primary: '#F97316', name: 'Orange' },
  gold: { primary: '#EAB308', name: 'Gold' },
  teal: { primary: '#14B8A6', name: 'Teal' },
  pink: { primary: '#EC4899', name: 'Pink' },
};
```

### Step 3.3: Update lib/knack.js

Add to raffle field mappings:

```javascript
theme_color: 'field_124',  // Replace with actual field ID
```

### Step 3.4: Update Create Raffle Form

**File:** `app/raffle/new/page.js`

**Add color presets constant** (at top of file or import from utils):

```javascript
const COLOR_PRESETS = {
  purple: { primary: '#8B5CF6', name: 'Purple' },
  blue: { primary: '#3B82F6', name: 'Blue' },
  green: { primary: '#10B981', name: 'Green' },
  red: { primary: '#EF4444', name: 'Red' },
  orange: { primary: '#F97316', name: 'Orange' },
  gold: { primary: '#EAB308', name: 'Gold' },
  teal: { primary: '#14B8A6', name: 'Teal' },
  pink: { primary: '#EC4899', name: 'Pink' },
};
```

**Add to initial form state:**

```javascript
theme_color: 'purple',
```

**Add form field** (after logo field):

```jsx
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Theme Color
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(COLOR_PRESETS).map(([key, color]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFormData({ ...formData, theme_color: key })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.theme_color === key 
                          ? 'border-white scale-105' 
                          : 'border-transparent hover:border-white/30'
                      }`}
                      style={{ backgroundColor: color.primary }}
                    >
                      <span className="sr-only">{color.name}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Selected: {COLOR_PRESETS[formData.theme_color]?.name || 'Purple'}
                </p>
              </div>
```

**Add to handleSubmit body:**

```javascript
theme_color: formData.theme_color || 'purple',
```

### Step 3.5: Update Edit Raffle Form

**File:** `app/raffle/[id]/edit/page.js`

Same changes as Step 3.4, plus load existing value.

### Step 3.6: Update Player Page

**File:** `app/r/[id]/page.js`

**Add color presets constant** at top of file (same as above).

**Get the color** after loading raffle:

```javascript
const themeColor = COLOR_PRESETS[raffle.theme_color]?.primary || COLOR_PRESETS.purple.primary;
```

**Apply to progress bar** (find the progress bar div):

```jsx
            <div
              className="h-full transition-all duration-500"
              style={{ 
                background: `linear-gradient(to right, ${themeColor}, ${themeColor}dd)`,
                width: `${((raffle.tickets_sold || 0) / raffle.max_tickets) * 100}%` 
              }}
            />
```

**Apply to Buy button** (find the submit button):

```jsx
              <button
                type="submit"
                className="btn w-full text-lg py-4"
                style={{ backgroundColor: themeColor }}
                disabled={submitting}
              >
```

### Step 3.7: Update Flyer

**File:** `app/raffle/[id]/flyer/page.js`

Add color presets constant and apply to flyer elements:

```jsx
const themeColor = COLOR_PRESETS[raffle.theme_color]?.primary || '#8B5CF6';
```

Update the divider:

```jsx
<div className="flyer-divider" style={{ backgroundColor: themeColor }}></div>
```

Update QR border:

```jsx
<div className="flyer-qr-wrapper" style={{ borderColor: themeColor }}>
```

---

## 4. Push Everything

```bash
cd C:\Users\mmaso\Desktop\Fiddy
git add .
git commit -m "Add logo, color presets, urgency threshold"
git push
```

---

## 5. Test Checklist

After Vercel deploys:

- [ ] Create new raffle with logo URL and color
- [ ] Verify logo shows on player page
- [ ] Verify logo shows on flyer
- [ ] Verify selected color shows on progress bar
- [ ] Verify selected color shows on Buy button
- [ ] Verify urgency message appears at 70% sold
- [ ] Verify no animation on urgency message
- [ ] Edit existing raffle, add logo/color
- [ ] Verify changes persist

---

## Quick Reference: Field IDs to Update

After adding Knack fields, update these files with actual field IDs:

| File | Fields to Add |
|------|---------------|
| `lib/knack.js` | `logo_url: 'field_XXX'`, `theme_color: 'field_YYY'` |

---

## Troubleshooting

**Logo not showing?**
- Check URL is publicly accessible (not Google Drive sharing link)
- Check browser console for CORS errors
- Try a different image host (Imgur, Cloudflare)

**Color not applying?**
- Check `raffle.theme_color` is being returned by API
- Check field mapping in `lib/knack.js`
- Add `console.log(raffle)` to debug

**Urgency message not appearing?**
- Check raffle has >70% tickets sold
- Check `ticketsRemaining > 0`

---

*Good luck tonight! Ping me if you hit any snags.*
