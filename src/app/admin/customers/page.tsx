"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { ColumnDef, getCoreRowModel, getPaginationRowModel, useReactTable, flexRender } from '@tanstack/react-table';
import { Modal, ModalHeader, ModalContent, ModalActions } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface BusinessOption { businessId: string; name: string; }

interface BusinessBreakdownItem { businessId: string; name: string; pointsLabel?: string; offerPoints: number; purchasePoints: number; totalPoints: number; }

interface Customer {
  userId: string;
  name: string;
  email: string;
  createdAt: string;
  public?: boolean;
  businessDisplayName?: string;
  offerPoints?: number;
  purchasePoints?: number;
  totalPoints?: number;
  businessBreakdown?: BusinessBreakdownItem[];
  [key: string]: any;
}

const fmt = (n?: number) => (n ?? 0).toLocaleString();
const withLabel = (n: number, label?: string) => {
  const base = label || 'Points';
  if (base.endsWith('Points')) {
    return `${fmt(n)} ${n === 1 ? base.replace(/Points$/, 'Point') : base}`;
  }
  return `${fmt(n)} ${base}`;
};

export default function CustomersAdminPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [businesses, setBusinesses] = useState<BusinessOption[]>([]);
  const [businessId, setBusinessId] = useState('');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/businesses')
      .then(res => res.json())
      .then(data => setBusinesses(data.businesses || []))
      .catch(() => setBusinesses([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    const url = new URL('/api/admin/customers', window.location.origin);
    url.searchParams.set('page', String(page));
    if (search) url.searchParams.set('search', search);
    if (businessId) url.searchParams.set('businessId', businessId);
    fetch(url.toString())
      .then(res => res.json())
      .then(data => {
        setCustomers(data.users || []);
        setTotalPages(data.totalPages || 1);
      })
      .finally(() => setLoading(false));
  }, [page, search, businessId]);

  const columns = useMemo<ColumnDef<Customer, any>[]>(() => [
    { header: 'Name', accessorKey: 'name' },
    { header: 'Email', accessorKey: 'email' },
    {
      header: 'Business',
      accessorKey: 'businessDisplayName',
      cell: ({ row, getValue }) => {
        const v = getValue<string>();
        if (v) return v;
        return row.original.public ? 'Public' : 'Unassigned';
      },
    },
    {
      header: 'Offer Points',
      accessorKey: 'offerPoints',
      cell: ({ row }) => {
        const b = row.original.businessBreakdown || [];
        const label = b.length === 1 ? b[0].pointsLabel : 'Points';
        return withLabel(row.original.offerPoints ?? 0, label);
      },
    },
    {
      header: 'Purchase Points',
      accessorKey: 'purchasePoints',
      cell: ({ row }) => {
        const b = row.original.businessBreakdown || [];
        const label = b.length === 1 ? b[0].pointsLabel : 'Points';
        return withLabel(row.original.purchasePoints ?? 0, label);
      },
    },
    {
      header: 'Total Points',
      accessorKey: 'totalPoints',
      cell: ({ row }) => {
        const b = row.original.businessBreakdown || [];
        const label = b.length === 1 ? b[0].pointsLabel : 'Points';
        return withLabel(row.original.totalPoints ?? 0, label);
      },
    },
    {
      header: 'Created At',
      accessorKey: 'createdAt',
      cell: ({ getValue }) => {
        const v = getValue<string>();
        const d = v ? new Date(v) : null;
        return d ? d.toLocaleString() : '';
      },
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setSelected(row.original)}>View</Button>
          {(row.original.businessBreakdown && row.original.businessBreakdown.length > 1) && (
            <Button size="sm" variant="ghost" onClick={() => setExpandedId(expandedId === row.original.userId ? null : row.original.userId)}>
              {expandedId === row.original.userId ? 'Hide' : 'Expand'}
            </Button>
          )}
        </div>
      ),
    },
  ], [expandedId]);

  const table = useReactTable({
    data: customers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-display text-h1 text-primary mb-2">Customers</h1>
        <p className="text-body text-gray600">Manage customers, view details, and filter by business.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          className="border px-3 py-2 rounded w-full sm:w-64"
          placeholder="Search by name or email"
          value={search}
          onChange={e => { setPage(1); setSearch(e.target.value); }}
        />
        <select
          className="border px-3 py-2 rounded w-full sm:w-auto"
          value={businessId}
          onChange={e => { setPage(1); setBusinessId(e.target.value); }}
        >
          <option value="">All Businesses</option>
          {businesses.map(b => (
            <option key={b.businessId} value={b.businessId}>{b.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-white max-h-[80vh] overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="bg-gray-100 text-left">
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="px-4 py-3 align-top">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={columns.length} className="text-center p-8">Loading...</td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan={columns.length} className="text-center p-8">No customers found.</td></tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <>
                  <tr key={row.id} className="border-t align-top">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-4 py-3 break-words">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                  {expandedId === row.original.userId && row.original.businessBreakdown && (
                    <tr className="bg-gray-50">
                      <td colSpan={columns.length} className="px-4 py-3">
                        <div className="overflow-auto">
                          <table className="min-w-full text-sm">
                            <thead>
                              <tr className="text-left">
                                <th className="px-3 py-2">Business</th>
                                <th className="px-3 py-2">Offer</th>
                                <th className="px-3 py-2">Purchase</th>
                                <th className="px-3 py-2">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {row.original.businessBreakdown.map(b => (
                                <tr key={b.businessId} className="border-t">
                                  <td className="px-3 py-2">{b.name}</td>
                                  <td className="px-3 py-2">{withLabel(b.offerPoints, b.pointsLabel)}</td>
                                  <td className="px-3 py-2">{withLabel(b.purchasePoints, b.pointsLabel)}</td>
                                  <td className="px-3 py-2">{withLabel(b.totalPoints, b.pointsLabel)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mt-4">
        <div className="flex gap-2 items-center">
          <Button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <span>Page {page} of {totalPages}</span>
          <Button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      </div>

      {selected && (
        <Modal isOpen={true} onClose={() => setSelected(null)}>
          <ModalHeader>Customer Details</ModalHeader>
          <ModalContent>
            <div className="space-y-2">
              <div><b>Name:</b> {selected.name}</div>
              <div><b>Email:</b> {selected.email}</div>
              <div><b>User ID:</b> {selected.userId}</div>
              <div><b>Created At:</b> {selected.createdAt ? new Date(selected.createdAt).toLocaleString() : ''}</div>
              <div><b>Business:</b> {selected.businessDisplayName ?? (selected.public ? 'Public' : 'Unassigned')}</div>
              <div className="pt-2"><b>Totals:</b> {withLabel(selected.offerPoints ?? 0, selected.businessBreakdown?.length === 1 ? selected.businessBreakdown?.[0]?.pointsLabel : 'Points')} (offer), {withLabel(selected.purchasePoints ?? 0, selected.businessBreakdown?.length === 1 ? selected.businessBreakdown?.[0]?.pointsLabel : 'Points')} (purchase), {withLabel(selected.totalPoints ?? 0, selected.businessBreakdown?.length === 1 ? selected.businessBreakdown?.[0]?.pointsLabel : 'Points')} (total)
              </div>
              {selected.businessBreakdown && selected.businessBreakdown.length > 1 && (
                <div className="pt-2">
                  <b>Per-Business Breakdown</b>
                  <table className="mt-2 min-w-full text-sm">
                    <thead>
                      <tr className="text-left">
                        <th className="px-3 py-2">Business</th>
                        <th className="px-3 py-2">Offer</th>
                        <th className="px-3 py-2">Purchase</th>
                        <th className="px-3 py-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.businessBreakdown.map(b => (
                        <tr key={b.businessId} className="border-t">
                          <td className="px-3 py-2">{b.name}</td>
                          <td className="px-3 py-2">{withLabel(b.offerPoints, b.pointsLabel)}</td>
                          <td className="px-3 py-2">{withLabel(b.purchasePoints, b.pointsLabel)}</td>
                          <td className="px-3 py-2">{withLabel(b.totalPoints, b.pointsLabel)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div>
                <b>Raw data:</b>
                <pre className="bg-gray-50 p-2 rounded overflow-auto text-xs max-h-60">{JSON.stringify(selected, null, 2)}</pre>
              </div>
            </div>
          </ModalContent>
          <ModalActions>
            <Button variant="ghost" onClick={() => setSelected(null)}>Close</Button>
          </ModalActions>
        </Modal>
      )}
    </div>
  );
}
