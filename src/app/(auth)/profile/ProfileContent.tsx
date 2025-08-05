'use client';

import {
    Card,
    CardContent,
    CardHeader,
    CardHeaderColumn,
    CardHeaderTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label/label';
import { FormTextInput } from '@/components/ui/input/input';
import { UserData } from '@/server/routers/usersRouter';

interface ProfileContentProps {
    userData: NonNullable<UserData>;
}

export default function ProfileContent({ userData }: ProfileContentProps) {
    return (
        <Card>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label>First Name</Label>
                        <FormTextInput
                            readOnly
                            type="text"
                            defaultValue={userData.firstName || ''}
                            placeholder="Enter your first name"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Last Name</Label>
                        <FormTextInput
                            readOnly
                            type="text"
                            defaultValue={userData.lastName || ''}
                            placeholder="Enter your last name"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Email Address</Label>
                        <FormTextInput
                            readOnly
                            type="email"
                            defaultValue={userData.email}
                            placeholder="Enter your email address"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <FormTextInput
                            readOnly
                            type="tel"
                            defaultValue={userData.phoneNumber || ''}
                            placeholder="Enter your phone number"
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
