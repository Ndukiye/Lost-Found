-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create items table
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    location_found TEXT NOT NULL,
    date_found TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'unclaimed' CHECK (status IN ('unclaimed', 'claimed', 'returned', 'expired')),
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create claims table
CREATE TABLE claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID REFERENCES items(id) ON DELETE CASCADE,
    claimant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    claim_date TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    proof_details TEXT NOT NULL,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create categories table for standardization
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name, description, icon) VALUES
('Electronics', 'Electronic devices and gadgets', 'smartphone'),
('Clothing', 'Clothing items and accessories', 'shirt'),
('Books', 'Books, notebooks, and study materials', 'book'),
('Keys', 'Keys and keychains', 'key'),
('Wallet', 'Wallets, purses, and financial items', 'wallet'),
('Bag', 'Bags, backpacks, and luggage', 'bag'),
('Jewelry', 'Jewelry and watches', 'diamond'),
('Documents', 'Important documents and IDs', 'file-text'),
('Sports', 'Sports equipment and gear', 'football'),
('Other', 'Miscellaneous items', 'box');

-- Create indexes for performance
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_owner_id ON items(owner_id);
CREATE INDEX idx_items_created_at ON items(created_at DESC);
CREATE INDEX idx_claims_item_id ON claims(item_id);
CREATE INDEX idx_claims_claimant_id ON claims(claimant_id);
CREATE INDEX idx_claims_status ON claims(status);

-- Set up storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES ('item_images', 'item_images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']);

-- Row Level Security Policies
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Items policies
CREATE POLICY "Anyone can view unclaimed items" ON items
    FOR SELECT USING (status = 'unclaimed');

CREATE POLICY "Authenticated users can create items" ON items
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own items" ON items
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own items" ON items
    FOR DELETE USING (auth.uid() = owner_id);

-- Claims policies
CREATE POLICY "Anyone can view approved claims" ON claims
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Authenticated users can create claims" ON claims
    FOR INSERT WITH CHECK (auth.uid() = claimant_id);

CREATE POLICY "Users can view their own claims" ON claims
    FOR SELECT USING (auth.uid() = claimant_id);

CREATE POLICY "Item owners can view claims on their items" ON claims
    FOR SELECT USING (auth.uid() IN (SELECT owner_id FROM items WHERE id = item_id));

-- Admin policies (assuming admin role)
CREATE POLICY "Admins can manage all items" ON items
    FOR ALL USING (EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage all claims" ON claims
    FOR ALL USING (EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND role = 'admin'));

-- Grant permissions
GRANT SELECT ON items TO anon;
GRANT ALL ON items TO authenticated;
GRANT SELECT ON claims TO anon;
GRANT ALL ON claims TO authenticated;
GRANT SELECT ON categories TO anon;

-- Storage bucket policies
CREATE POLICY "Anyone can view item images" ON storage.objects
    FOR SELECT USING (bucket_id = 'item_images');

CREATE POLICY "Authenticated users can upload item images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'item_images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own images" ON storage.objects
    FOR UPDATE USING (auth.uid() = (storage.foldername(name))[1]::uuid);

CREATE POLICY "Users can delete their own images" ON storage.objects
    FOR DELETE USING (auth.uid() = (storage.foldername(name))[1]::uuid);