import { useEffect, useMemo, useState } from 'react'
import { ImagePlus, Pencil, Plus, Trash2 } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Input'
import { CategoryDto, SubcategoryDto } from '@/api'
import { allowedImageTypes, maxImageSizeBytes } from '@/features/admin/categories/api'
import { useAdminCategoriesQuery, useCategoryImageViewUrlQuery, useCreateAdminCategoryMutation, useCreateAdminSubcategoryMutation, useRemoveCategoryImageMutation, useRemoveSubcategoryImageMutation, useSubcategoryImageViewUrlQuery, useUpdateAdminCategoryMutation, useUpdateAdminSubcategoryMutation, useUploadCategoryImageMutation, useUploadSubcategoryImageMutation } from '@/features/admin/categories/hooks'
import { CategoryFormValues } from '@/features/admin/categories/types/create-category-form-values.type'
import { SubcategoryFormValues } from '@/features/admin/categories/types/create-subcategory-form-values.type'
import { getApiErrorResponse } from '@/lib/api-error'
import { Badge } from '@/components/ui/Badge'
import { useSearchParams } from 'react-router-dom'
import { Pagination } from '@/components/ui/Pagination'
import { CategoryFormFields, validateCategoryForm, validateSubcategoryForm } from '@/features/admin/categories/validation'

const PAGE_SIZE = 10

type CategoryModalState =
  | { mode: 'create'; category?: never }
  | { mode: 'edit'; category: CategoryDto }
  | null

type SubcategoryModalState =
  | { mode: 'create'; category: CategoryDto; subcategory?: never }
  | { mode: 'edit'; category: CategoryDto; subcategory: SubcategoryDto }
  | null

const toText = (value: unknown) => (typeof value === 'string' ? value : '')

const buildSlug = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

const validateImageFile = (file: File) => {
  if (!allowedImageTypes.includes(file.type as never)) {
    return 'Only JPG, PNG, and WEBP images are allowed.'
  }

  if (file.size > maxImageSizeBytes) {
    return 'Image must be 5 MB or smaller.'
  }

  return null
}

function CategoryImage({ category, className = 'h-14 w-20', }: {
  category: CategoryDto
  className?: string
}) {
  const hasImage = Boolean(category.imageStorageKey)
  const { data } = useCategoryImageViewUrlQuery(category.id, hasImage)

  if (!hasImage) {
    return (
      <div className={`${className} flex items-center justify-center rounded-lg bg-stone-100 text-stone-300`}>
        <ImagePlus size={18} />
      </div>
    )
  }

  return (
    <img
      src={data?.viewUrl}
      alt={category.name}
      className={`${className} rounded-lg object-cover bg-stone-100`}
    />
  )
}

function SubcategoryImage({ categoryId, subcategory, }: {
  categoryId: string
  subcategory: SubcategoryDto
}) {
  const hasImage = Boolean(subcategory.imageStorageKey)
  const { data } = useSubcategoryImageViewUrlQuery(categoryId, subcategory.id, hasImage)

  if (!hasImage) {
    return (
      <div className="h-10 w-14 flex items-center justify-center rounded-md bg-stone-100 text-stone-300">
        <ImagePlus size={15} />
      </div>
    )
  }

  return (
    <img
      src={data?.viewUrl}
      alt={subcategory.name}
      className="h-10 w-14 rounded-md object-cover bg-stone-100"
    />
  )
}

function CategoryFormModal({ state, onClose, }: {
  state: CategoryModalState
  onClose: () => void
}) {
  const createMutation = useCreateAdminCategoryMutation()
  const updateMutation = useUpdateAdminCategoryMutation()

  const [name, setName] = useState(state?.mode === 'edit' ? state.category.name : '')
  const [slug, setSlug] = useState(state?.mode === 'edit' ? state.category.slug : '')
  const [description, setDescription] = useState(state?.mode === 'edit' ? toText(state.category.description) : '',)
  const [sortOrder, setSortOrder] = useState(state?.mode === 'edit' ? String(state.category.sortOrder) : '0',)

  const [errors, setErrors] = useState<Partial<Record<CategoryFormFields, string>>>({})

  if (!state) return null

  const isEdit = state.mode === 'edit'
  const isPending = createMutation.isPending || updateMutation.isPending

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const validationErrors = validateCategoryForm({
      name,
      slug,
      description,
      sortOrder,
    })

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    const values: CategoryFormValues = {
      name,
      slug: slug || buildSlug(name),
      description,
      sortOrder: Number(sortOrder || 0),
    }

    if (isEdit) {
      await updateMutation.mutateAsync({
        categoryId: state.category.id,
        values,
      })
    } else {
      await createMutation.mutateAsync(values)
    }

    onClose()
  }

  return (
    <Modal
      open={Boolean(state)}
      onClose={onClose}
      title={isEdit ? 'Edit category' : 'Add category'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Name" value={name} onChange={(event) => {
          setName(event.target.value)
          setErrors((prev) => ({ ...prev, name: '' }))
        }}
          error={errors.name}
          required
        />
        <Input label="Slug" value={slug} onChange={(event) => {
          setSlug(event.target.value)
          setErrors((prev) => ({ ...prev, slug: '' }))
        }}
          error={errors.slug}
        />
        <Textarea
          label="Description"
          value={description}
          onChange={(event) => {
            setDescription(event.target.value)
            setErrors((prev) => ({ ...prev, description: '' }))
          }}
          error={errors.description}
          rows={3}
        />
        <Input
          label="Sort order"
          type="number"
          value={sortOrder}
          onChange={(event) => {
            setSortOrder(event.target.value)
            setErrors((prev) => ({ ...prev, sortOrder: '' }))
          }}
          error={errors.sortOrder}
        />
        <div className="flex gap-3">
          <Button type="submit" loading={isPending} className="flex-1">
            {isEdit ? 'Save changes' : 'Create category'}
          </Button>
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function SubcategoryFormModal({ state, onClose, }: {
  state: SubcategoryModalState
  onClose: () => void
}) {
  const createMutation = useCreateAdminSubcategoryMutation()
  const updateMutation = useUpdateAdminSubcategoryMutation()

  const [name, setName] = useState(state?.mode === 'edit' ? state.subcategory.name : '')
  const [slug, setSlug] = useState(state?.mode === 'edit' ? state.subcategory.slug : '')
  const [description, setDescription] = useState(state?.mode === 'edit' ? toText(state.subcategory.description) : '',)
  const [sortOrder, setSortOrder] = useState(state?.mode === 'edit' ? String(state.subcategory.sortOrder) : '0',)

  const [errors, setErrors] = useState<Partial<Record<CategoryFormFields, string>>>({})

  if (!state) return null

  const isEdit = state.mode === 'edit'
  const isPending = createMutation.isPending || updateMutation.isPending

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const validationErrors = validateSubcategoryForm({
      name,
      slug,
      description,
      sortOrder,
    })

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    const values: SubcategoryFormValues = {
      name,
      slug: slug || buildSlug(name),
      description,
      sortOrder: Number(sortOrder || 0),
    }

    if (isEdit) {
      await updateMutation.mutateAsync({
        categoryId: state.category.id,
        subcategoryId: state.subcategory.id,
        values,
      })
    } else {
      await createMutation.mutateAsync({
        categoryId: state.category.id,
        values,
      })
    }

    onClose()
  }

  return (
    <Modal
      open={Boolean(state)}
      onClose={onClose}
      title={isEdit ? 'Edit subcategory' : `Add subcategory to ${state.category.name}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Name" value={name} onChange={(event) => {
          setName(event.target.value)
          setErrors((prev) => ({ ...prev, name: '' }))
        }}
          error={errors.name}
          required
        />
        <Input label="Slug" value={slug} onChange={(event) => {
          setSlug(event.target.value)
          setErrors((prev) => ({ ...prev, slug: '' }))
        }}
          error={errors.slug}
        />
        <Textarea
          label="Description"
          value={description}
          onChange={(event) => {
            setDescription(event.target.value)
            setErrors((prev) => ({ ...prev, description: '' }))
          }}
          error={errors.description}
          rows={3}
        />
        <Input
          label="Sort order"
          type="number"
          value={sortOrder}
          onChange={(event) => {
            setSortOrder(event.target.value)
            setErrors((prev) => ({ ...prev, sortOrder: '' }))
          }}
          error={errors.sortOrder}
        />
        <div className="flex gap-3">
          <Button type="submit" loading={isPending} className="flex-1">
            {isEdit ? 'Save changes' : 'Create subcategory'}
          </Button>
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export function ManageSkills() {
  const [searchParams, setSearchParams] = useSearchParams()

  const page = Math.max(Number(searchParams.get('page') || '1') || 1, 1)
  const committedSearch = searchParams.get('search')?.trim() ?? ''

  const rawIsActive = searchParams.get('isActive')
  const isActive = rawIsActive === 'true' ? true : rawIsActive === 'false' ? false : undefined

  const [searchInput, setSearchInput] = useState(committedSearch)

  useEffect(() => {
    setSearchInput(committedSearch)
  }, [committedSearch])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const nextSearch = searchInput.trim()

      if (nextSearch === committedSearch) return

      const nextParams = new URLSearchParams(searchParams)

      if (nextSearch) {
        nextParams.set('search', nextSearch)
      } else {
        nextParams.delete('search')
      }

      nextParams.set('page', '1')
      setSearchParams(nextParams, { replace: true })
    }, 400)

    return () => window.clearTimeout(timeout)
  }, [searchInput, committedSearch, searchParams, setSearchParams])

  const query = useMemo(() => ({
    page,
    limit: PAGE_SIZE,
    search: committedSearch || undefined,
    isActive,
  }),
    [page, committedSearch, isActive],
  )

  const { data, isLoading, isError, error, isFetching } = useAdminCategoriesQuery(query)

  const categories = data?.items ?? []
  const createCategoryModal = useState<CategoryModalState>(null)
  const createSubcategoryModal = useState<SubcategoryModalState>(null)

  const [categoryModal, setCategoryModal] = createCategoryModal
  const [subcategoryModal, setSubcategoryModal] = createSubcategoryModal
  const [imageError, setImageError] = useState<string | null>(null)

  const updateCategoryMutation = useUpdateAdminCategoryMutation()
  const updateSubcategoryMutation = useUpdateAdminSubcategoryMutation()
  const uploadCategoryImageMutation = useUploadCategoryImageMutation()
  const removeCategoryImageMutation = useRemoveCategoryImageMutation()
  const uploadSubcategoryImageMutation = useUploadSubcategoryImageMutation()
  const removeSubcategoryImageMutation = useRemoveSubcategoryImageMutation()

  const activeCount = useMemo(() => categories.filter((category) => category.isActive).length, [categories],)

  const handleCategoryImage = async (categoryId: string, file?: File) => {
    if (!file) return

    const validationError = validateImageFile(file)

    if (validationError) {
      setImageError(validationError)
      return
    }

    setImageError(null)
    await uploadCategoryImageMutation.mutateAsync({ categoryId, file })
  }

  const handleSubcategoryImage = async (categoryId: string, subcategoryId: string, file?: File,) => {
    if (!file) return

    const validationError = validateImageFile(file)

    if (validationError) {
      setImageError(validationError)
      return
    }

    setImageError(null)
    await uploadSubcategoryImageMutation.mutateAsync({
      categoryId,
      subcategoryId,
      file,
    })
  }

  const handleStatusChange = (value: string) => {
    const nextParams = new URLSearchParams(searchParams)

    if (value) {
      nextParams.set('isActive', value)
    } else {
      nextParams.delete('isActive')
    }

    nextParams.set('page', '1')
    setSearchParams(nextParams)
  }

  if (isLoading) {
    return <div className="text-sm text-stone-500">Loading categories...</div>
  }

  if (isError) {
    return (
      <div className="text-sm text-red-500">
        {getApiErrorResponse(error, 'Failed to load categories')}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-kala-brown">Manage Skills</h1>
          <p className="text-stone-500 text-sm mt-1">
            {categories.length} categories, {activeCount} active
          </p>
        </div>
        <Button onClick={() => setCategoryModal({ mode: 'create' })} className="gap-2">
          <Plus size={16} />
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-stone-500">Search</span>
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by name, slug, or description..."
            className="h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-700 shadow-sm outline-none transition focus:border-kala-brown focus:ring-2 focus:ring-kala-brown/20"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-stone-500">Status</span>
          <select
            value={rawIsActive ?? ''}
            onChange={(event) => handleStatusChange(event.target.value)}
            className="h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-700 shadow-sm outline-none transition focus:border-kala-brown focus:ring-2 focus:ring-kala-brown/20"
          >
            <option value="">All statuses</option>
            <option value="true">Active</option>
            <option value="false">Hidden</option>
          </select>
        </label>
      </div>

      {imageError && (
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {imageError}
        </div>
      )}

      <div className="space-y-4">
        {categories.map((category) => (
          <Card key={category.id} className="overflow-hidden">
            <div className="flex flex-col gap-4 border-b border-stone-100 p-5 md:flex-row md:items-start md:justify-between">
              <div className="flex gap-4">
                <CategoryImage category={category} />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-stone-800">{category.name}</h2>
                    <Badge variant={category.isActive ? 'success' : 'default'}>
                      {category.isActive ? 'Active' : 'Hidden'}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-stone-400">/{category.slug}</p>
                  {toText(category.description) && (
                    <p className="mt-2 max-w-2xl text-sm text-stone-500">
                      {toText(category.description)}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <label>
                  <input
                    type="file"
                    accept={allowedImageTypes.join(',')}
                    className="hidden"
                    onChange={(event) =>
                      handleCategoryImage(category.id, event.target.files?.[0])
                    }
                  />
                  <span className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50">
                    Image
                  </span>
                </label>

                {category.imageStorageKey && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCategoryImageMutation.mutateAsync(category.id)}
                  >
                    <Trash2 size={15} />
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCategoryModal({ mode: 'edit', category })}
                >
                  <Pencil size={15} />
                </Button>

                <Button
                  variant={category.isActive ? 'destructive' : 'primary'}
                  size="sm"
                  onClick={() =>
                    updateCategoryMutation.mutateAsync({
                      categoryId: category.id,
                      values: { name: category.name, isActive: !category.isActive },
                    })
                  }
                >
                  {category.isActive ? 'Unlist' : 'List'}
                </Button>
              </div>
            </div>

            <div className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-stone-700">Subcategories</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSubcategoryModal({ mode: 'create', category })}
                >
                  <Plus size={15} />
                  Add
                </Button>
              </div>

              <div className="space-y-2">
                {category.subcategories.map((subcategory) => (
                  <div
                    key={subcategory.id}
                    className="flex flex-col gap-3 rounded-lg border border-stone-100 bg-stone-50 px-4 py-3 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <SubcategoryImage categoryId={category.id} subcategory={subcategory} />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium text-stone-800">
                            {subcategory.name}
                          </p>
                          <Badge variant={subcategory.isActive ? 'success' : 'default'}>
                            {subcategory.isActive ? 'Active' : 'Hidden'}
                          </Badge>
                        </div>
                        <p className="text-xs text-stone-400">/{subcategory.slug}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <label>
                        <input
                          type="file"
                          accept={allowedImageTypes.join(',')}
                          className="hidden"
                          onChange={(event) =>
                            handleSubcategoryImage(
                              category.id,
                              subcategory.id,
                              event.target.files?.[0],
                            )
                          }
                        />
                        <span className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50">
                          Image
                        </span>
                      </label>

                      {subcategory.imageStorageKey && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            removeSubcategoryImageMutation.mutateAsync({
                              categoryId: category.id,
                              subcategoryId: subcategory.id,
                            })
                          }
                        >
                          <Trash2 size={15} />
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setSubcategoryModal({
                            mode: 'edit',
                            category,
                            subcategory,
                          })
                        }
                      >
                        <Pencil size={15} />
                      </Button>

                      <Button
                        variant={subcategory.isActive ? 'destructive' : 'primary'}
                        size="sm"
                        onClick={() =>
                          updateSubcategoryMutation.mutateAsync({
                            categoryId: category.id,
                            subcategoryId: subcategory.id,
                            values: {
                              name: subcategory.name,
                              isActive: !subcategory.isActive,
                            },
                          })
                        }
                      >
                        {subcategory.isActive ? 'Unlist' : 'List'}
                      </Button>
                    </div>
                  </div>
                ))}

                {category.subcategories.length === 0 && (
                  <p className="rounded-lg border border-dashed border-stone-200 px-4 py-6 text-center text-sm text-stone-400">
                    No subcategories yet.
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}

        {categories.length === 0 && (
          <Card className="p-8 text-center text-sm text-stone-500">
            No categories created yet.
          </Card>
        )}
      </div>

      {data && (
        <Pagination
          page={data.meta.page}
          limit={data.meta.limit}
          total={data.meta.total}
          hasNextPage={data.meta.hasNextPage}
          hasPrevPage={data.meta.hasPrevPage}
          onPageChange={(nextPage) => {
            const nextParams = new URLSearchParams(searchParams)
            nextParams.set('page', String(nextPage))
            setSearchParams(nextParams)
          }}
        />
      )}

      {categoryModal && (
        <CategoryFormModal
          key={categoryModal.mode === 'edit' ? categoryModal.category.id : 'create-category'}
          state={categoryModal}
          onClose={() => setCategoryModal(null)}
        />
      )}

      {subcategoryModal && (
        <SubcategoryFormModal
          key={
            subcategoryModal.mode === 'edit'
              ? subcategoryModal.subcategory.id
              : `create-subcategory-${subcategoryModal.category.id}`
          }
          state={subcategoryModal}
          onClose={() => setSubcategoryModal(null)}
        />
      )}
    </div>
  )
}