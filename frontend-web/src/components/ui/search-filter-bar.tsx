import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterConfig {
  /** 筛选器的值 */
  value: string;
  /** 值变化回调 */
  onChange: (value: string) => void;
  /** 占位符 */
  placeholder?: string;
  /** 选项列表 */
  options: FilterOption[];
  /** 宽度 class */
  width?: string;
}

interface SearchFilterBarProps {
  /** 搜索关键词 */
  keyword: string;
  /** 关键词变化回调 */
  onKeywordChange: (keyword: string) => void;
  /** 搜索回调（Enter 或点击搜索按钮） */
  onSearch: () => void;
  /** 筛选器配置列表 */
  filters?: FilterConfig[];
  /** 搜索框占位符 */
  placeholder?: string;
  /** 右侧额外操作按钮 */
  actions?: React.ReactNode;
}

/**
 * 通用搜索+筛选栏
 * 替代 EnterpriseAudit/UserManage/Research 中重复的搜索筛选 UI
 *
 * @example
 * <SearchFilterBar
 *   keyword={keyword}
 *   onKeywordChange={setKeyword}
 *   onSearch={handleSearch}
 *   filters={[{
 *     value: statusFilter,
 *     onChange: setStatusFilter,
 *     placeholder: "状态",
 *     options: [
 *       { value: 'all', label: '全部' },
 *       { value: '1', label: '已通过' },
 *     ],
 *   }]}
 *   actions={<Button onClick={handleCreate}>新建</Button>}
 * />
 */
export function SearchFilterBar({
  keyword,
  onKeywordChange,
  onSearch,
  filters = [],
  placeholder = '搜索...',
  actions,
}: SearchFilterBarProps) {
  return (
    <div className="flex gap-2 flex-wrap items-center">
      <Input
        placeholder={placeholder}
        value={keyword}
        onChange={(e) => onKeywordChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        className="max-w-xs"
      />
      <Button variant="outline" size="icon" onClick={onSearch}>
        <Search className="h-4 w-4" />
      </Button>
      {filters.map((filter, index) => (
        <Select
          key={index}
          value={filter.value}
          onValueChange={(v) => {
            filter.onChange(v);
          }}
        >
          <SelectTrigger className={filter.width || 'w-28'}>
            <SelectValue placeholder={filter.placeholder || '请选择'} />
          </SelectTrigger>
          <SelectContent>
            {filter.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
      {actions && <div className="ml-auto">{actions}</div>}
    </div>
  );
}
