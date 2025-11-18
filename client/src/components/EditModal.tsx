import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import type { DocumentData, DocumentType, InvoiceType } from '../types';

interface EditModalProps {
  isOpen: boolean;
  document: DocumentData | null;
  onClose: () => void;
  onSave: (document: DocumentData) => void;
}

export default function EditModal({ isOpen, document, onClose, onSave }: EditModalProps) {
  const [formData, setFormData] = useState<Partial<DocumentData>>({});

  useEffect(() => {
    if (document) {
      setFormData({ ...document });
    }
  }, [document]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (document && formData) {
      onSave({ ...document, ...formData } as DocumentData);
      onClose();
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTripDetailsChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      tripDetails: {
        ...(prev.tripDetails || {
          platform: '',
          departure: '',
          destination: '',
          time: '',
          distanceKm: 0,
        }),
        [field]: value,
      },
    }));
  };

  if (!document) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  编辑文档信息
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Basic Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        文档类型
                      </label>
                      <select
                        value={formData.documentType || ''}
                        onChange={(e) => handleChange('documentType', e.target.value as DocumentType)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="invoice">发票</option>
                        <option value="trip_sheet">行程单</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        文件名
                      </label>
                      <input
                        type="text"
                        value={formData.fileName || ''}
                        onChange={(e) => handleChange('fileName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        日期
                      </label>
                      <input
                        type="text"
                        value={formData.date || ''}
                        onChange={(e) => handleChange('date', e.target.value)}
                        placeholder="MM/DD"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        金额
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.amount || ''}
                        onChange={(e) => handleChange('amount', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      描述
                    </label>
                    <input
                      type="text"
                      value={formData.description || ''}
                      onChange={(e) => handleChange('description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      置信度 (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.confidence || ''}
                      onChange={(e) => handleChange('confidence', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Invoice-specific fields */}
                  {formData.documentType === 'invoice' && (
                    <>
                      <div className="border-t pt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">发票信息</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              发票类型
                            </label>
                            <select
                              value={formData.invoiceType || ''}
                              onChange={(e) => handleChange('invoiceType', e.target.value as InvoiceType)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">选择类型</option>
                              <option value="taxi">出租车</option>
                              <option value="hotel">酒店</option>
                              <option value="train">火车</option>
                              <option value="shipping">快递</option>
                              <option value="toll">过路费</option>
                              <option value="consumables">消耗品</option>
                              <option value="other">其他</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              发票号
                            </label>
                            <input
                              type="text"
                              value={formData.invoiceNumber || ''}
                              onChange={(e) => handleChange('invoiceNumber', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              商家
                            </label>
                            <input
                              type="text"
                              value={formData.vendor || ''}
                              onChange={(e) => handleChange('vendor', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              税额
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={formData.taxAmount || ''}
                              onChange={(e) => handleChange('taxAmount', parseFloat(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Trip sheet-specific fields */}
                  {formData.documentType === 'trip_sheet' && (
                    <>
                      <div className="border-t pt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">行程信息</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              平台
                            </label>
                            <input
                              type="text"
                              value={formData.tripDetails?.platform || ''}
                              onChange={(e) => handleTripDetailsChange('platform', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                出发地
                              </label>
                              <input
                                type="text"
                                value={formData.tripDetails?.departure || ''}
                                onChange={(e) => handleTripDetailsChange('departure', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                目的地
                              </label>
                              <input
                                type="text"
                                value={formData.tripDetails?.destination || ''}
                                onChange={(e) => handleTripDetailsChange('destination', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                时间
                              </label>
                              <input
                                type="text"
                                value={formData.tripDetails?.time || ''}
                                onChange={(e) => handleTripDetailsChange('time', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                距离 (km)
                              </label>
                              <input
                                type="number"
                                step="0.1"
                                value={formData.tripDetails?.distanceKm || ''}
                                onChange={(e) => handleTripDetailsChange('distanceKm', parseFloat(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                    >
                      保存
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
