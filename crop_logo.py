from PIL import Image, ImageChops

def trim(im):
    bg = Image.new(im.mode, im.size, im.getpixel((0,0)))
    diff = ImageChops.difference(im, bg)
    diff = ImageChops.add(diff, diff, 2.0, -100)
    bbox = diff.getbbox()
    if bbox:
        return im.crop(bbox)
    return im

def trim_transparent(im):
    if im.mode != 'RGBA':
        im = im.convert('RGBA')
    bbox = im.getbbox()
    if bbox:
        return im.crop(bbox)
    return im

path = 'retro-cursor-friend-invite-time-sync-5487/public/icons/logo/logo.png'
img = Image.open(path)

# Try trimming based on transparency first
trimmed_img = trim_transparent(img)

# If it didn't change much or if it's not transparent, try trimming based on background color
if trimmed_img.size == img.size:
    trimmed_img = trim(img)

trimmed_img.save(path)
print(f"Original size: {img.size}")
print(f"New size: {trimmed_img.size}")
