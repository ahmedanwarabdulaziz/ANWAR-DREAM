# Cloudinary Configuration
# Your Cloudinary credentials (already configured)

# Cloudinary URL (complete connection string)
CLOUDINARY_URL=cloudinary://984549417134457:zfKeoO4s5EUBljSHZYUmtBcUeSM@dbo3xd0df

# Individual credentials (for reference)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dbo3xd0df
CLOUDINARY_API_KEY=984549417134457
CLOUDINARY_API_SECRET=zfKeoO4s5EUBljSHZYUmtBcUeSM

# Upload Preset Configuration
# Create an "unsigned" upload preset in Cloudinary with these settings:
# - Preset name: "business_logos"
# - Signing Mode: "Unsigned"
# - Folder: "business-logos"
# - Allowed formats: "jpg, jpeg, png, gif, webp"
# - Max file size: "10MB"
# - Transformations: Auto-optimize for web delivery

# Hybrid Security Approach:
# - Unsigned presets: For user-generated content (business logos)
# - Signed uploads: For sensitive/admin content (when needed)
