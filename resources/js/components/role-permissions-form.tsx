import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

type Props = {
    groups: Record<string, Record<string, string>>;
    selected: string[];
    onToggle: (route: string) => void;
};

export default function RolePermissionsForm({ groups, selected, onToggle }: Props) {
    const allRoutes = Object.values(groups).flatMap((routes) => Object.values(routes));

    const allSelected = allRoutes.length > 0 && allRoutes.every((r) => selected.includes(r));

    const toggleAll = () => {
        if (allSelected) {
            allRoutes.forEach((r) => {
                if (selected.includes(r)) onToggle(r);
            });
        } else {
            allRoutes.forEach((r) => {
                if (!selected.includes(r)) onToggle(r);
            });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Checkbox
                    id="select-all"
                    checked={allSelected}
                    onCheckedChange={toggleAll}
                />
                <Label htmlFor="select-all">All routes</Label>
            </div>

            {Object.entries(groups).map(([group, routes]) => {
                const groupRoutes = Object.values(routes);
                const groupSelected = groupRoutes.every((r) => selected.includes(r));
                const someSelected = groupRoutes.some((r) => selected.includes(r));

                return (
                    <div key={group} className="rounded-lg border p-4">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id={`group-${group}`}
                                checked={groupSelected}
                                data-state={someSelected && !groupSelected ? 'indeterminate' : undefined}
                                onCheckedChange={() => {
                                    if (groupSelected) {
                                        groupRoutes.forEach((r) => {
                                            if (selected.includes(r)) onToggle(r);
                                        });
                                    } else {
                                        groupRoutes.forEach((r) => {
                                            if (!selected.includes(r)) onToggle(r);
                                        });
                                    }
                                }}
                            />
                            <Label htmlFor={`group-${group}`} className="font-semibold">
                                {group}
                            </Label>
                        </div>

                        <div className="mt-3 grid gap-2 pl-6 sm:grid-cols-2">
                            {Object.entries(routes).map(([key, route]) => (
                                <div key={key} className="flex items-center gap-2">
                                    <Checkbox
                                        id={`route-${route}`}
                                        checked={selected.includes(route)}
                                        onCheckedChange={() => onToggle(route)}
                                    />
                                    <Label htmlFor={`route-${route}`} className="cursor-pointer font-normal">
                                        {key}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}