import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Settings from '@/models/Settings';

const DEFAULT_SETTINGS = {
    basePrice: 100,
    bidIncrement: 10,
    auctionStatus: 'pending',
    currentPlayerIndex: 0,
};

// GET settings (create if doesn't exist)
export async function GET() {
    try {
        await connectDB();
        let settings = await Settings.findOne({});

        // Create default settings if none exist
        if (!settings) {
            settings = await Settings.create(DEFAULT_SETTINGS);
        }

        return NextResponse.json({
            basePrice: settings.basePrice,
            bidIncrement: settings.bidIncrement,
            auctionStatus: settings.auctionStatus,
            currentPlayerIndex: settings.currentPlayerIndex,
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

// PATCH update settings
export async function PATCH(request) {
    try {
        await connectDB();
        const body = await request.json();

        let settings = await Settings.findOne({});

        if (!settings) {
            settings = await Settings.create({ ...DEFAULT_SETTINGS, ...body });
        } else {
            settings = await Settings.findOneAndUpdate(
                {},
                { $set: body },
                { new: true }
            );
        }

        return NextResponse.json({
            basePrice: settings.basePrice,
            bidIncrement: settings.bidIncrement,
            auctionStatus: settings.auctionStatus,
            currentPlayerIndex: settings.currentPlayerIndex,
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}

// DELETE reset settings to default
export async function DELETE() {
    try {
        await connectDB();
        await Settings.deleteMany({});
        const settings = await Settings.create(DEFAULT_SETTINGS);

        return NextResponse.json({
            basePrice: settings.basePrice,
            bidIncrement: settings.bidIncrement,
            auctionStatus: settings.auctionStatus,
            currentPlayerIndex: settings.currentPlayerIndex,
        });
    } catch (error) {
        console.error('Error resetting settings:', error);
        return NextResponse.json({ error: 'Failed to reset settings' }, { status: 500 });
    }
}
