export const codeTemplates = {
  javascript: {
    name: 'JavaScript',
    icon: '🟨',
    code: `import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * 用户数据管理模块
 * @version 1.0.0
 */
class UserManager {
  constructor(apiBase) {
    this.apiBase = apiBase;
    this.cache = new Map();
  }

  async fetchUsers(params = {}) {
    const cacheKey = JSON.stringify(params);
    
    if (this.cache.has(cacheKey)) {
      console.log('Returning cached data');
      return this.cache.get(cacheKey);
    }

    try {
      const response = await axios.get(\`\${this.apiBase}/users\`, { params });
      this.cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw error;
    }
  }

  async createUser(userData) {
    const response = await axios.post(\`\${this.apiBase}/users\`, userData);
    this.cache.clear();
    return response.data;
  }
}

function UserDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const managerRef = useRef(null);

  useEffect(() => {
    managerRef.current = new UserManager('https://api.example.com');
    loadUsers();
  }, [filter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await managerRef.current.fetchUsers({ status: filter });
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (formData) => {
    try {
      await managerRef.current.createUser(formData);
      loadUsers();
    } catch (error) {
      alert('Failed to create user');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="user-dashboard">
      <h1>User Management</h1>
      <div className="filters">
        <button onClick={() => setFilter('all')}>All</button>
        <button onClick={() => setFilter('active')}>Active</button>
        <button onClick={() => setFilter('inactive')}>Inactive</button>
      </div>
      <div className="user-list">
        {users.map(user => (
          <div key={user.id} className="user-card">
            <h3>{user.name}</h3>
            <p>{user.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserDashboard;`,
  },

  python: {
    name: 'Python',
    icon: '🐍',
    code: `import asyncio
import aiohttp
from typing import List, Dict, Optional
from datetime import datetime, timedelta

class DataAnalyzer:
    """
    数据分析处理类
    用于处理大规模数据分析任务
    """
    
    def __init__(self, api_endpoint: str, batch_size: int = 100):
        self.api_endpoint = api_endpoint
        self.batch_size = batch_size
        self.cache = {}
    
    async def fetch_data(self, params: Dict) -> List[Dict]:
        """异步获取数据"""
        cache_key = str(sorted(params.items()))
        
        if cache_key in self.cache:
            print(f"Cache hit: {cache_key}")
            return self.cache[cache_key]
        
        async with aiohttp.ClientSession() as session:
            async with session.get(self.api_endpoint, params=params) as response:
                data = await response.json()
                self.cache[cache_key] = data
                return data
    
    def process_batch(self, data: List[Dict]) -> List[Dict]:
        """批量处理数据"""
        results = []
        
        for item in data:
            processed = {
                'id': item['id'],
                'value': item['value'] * 1.1,  # 加权处理
                'timestamp': datetime.now().isoformat(),
                'category': self._categorize(item['value'])
            }
            results.append(processed)
        
        return results
    
    def _categorize(self, value: float) -> str:
        """数据分类"""
        if value < 100:
            return 'low'
        elif value < 500:
            return 'medium'
        else:
            return 'high'
    
    async def analyze(self, start_date: str, end_date: str) -> Dict:
        """执行完整分析"""
        params = {
            'start_date': start_date,
            'end_date': end_date,
            'limit': self.batch_size
        }
        
        raw_data = await self.fetch_data(params)
        processed_data = self.process_batch(raw_data)
        
        # 统计分析
        stats = {
            'total': len(processed_data),
            'avg_value': sum(d['value'] for d in processed_data) / len(processed_data),
            'categories': self._count_categories(processed_data)
        }
        
        return {
            'data': processed_data,
            'statistics': stats,
            'generated_at': datetime.now().isoformat()
        }
    
    def _count_categories(self, data: List[Dict]) -> Dict[str, int]:
        """统计分类数量"""
        counts = {'low': 0, 'medium': 0, 'high': 0}
        for item in data:
            counts[item['category']] += 1
        return counts

async def main():
    analyzer = DataAnalyzer('https://api.example.com/data')
    
    start = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
    end = datetime.now().strftime('%Y-%m-%d')
    
    results = await analyzer.analyze(start, end)
    
    print(f"Analysis complete: {results['statistics']['total']} records processed")
    print(f"Average value: {results['statistics']['avg_value']:.2f}")
    print(f"Categories: {results['statistics']['categories']}")

if __name__ == '__main__':
    asyncio.run(main())`,
  },

  java: {
    name: 'Java',
    icon: '☕',
    code: `package com.company.service;

import java.util.*;
import java.util.concurrent.*;
import java.util.stream.Collectors;

/**
 * 订单处理服务
 * @author Development Team
 * @version 2.0.0
 */
public class OrderProcessingService {
    
    private final ExecutorService executorService;
    private final Map<String, Order> orderCache;
    private final OrderRepository repository;
    
    public OrderProcessingService(OrderRepository repository) {
        this.repository = repository;
        this.executorService = Executors.newFixedThreadPool(10);
        this.orderCache = new ConcurrentHashMap<>();
    }
    
    /**
     * 批量处理订单
     * @param orderIds 订单ID列表
     * @return 处理结果
     */
    public CompletableFuture<List<OrderResult>> processBatch(List<String> orderIds) {
        List<CompletableFuture<OrderResult>> futures = orderIds.stream()
            .map(this::processOrderAsync)
            .collect(Collectors.toList());
        
        return CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
            .thenApply(v -> futures.stream()
                .map(CompletableFuture::join)
                .collect(Collectors.toList()));
    }
    
    private CompletableFuture<OrderResult> processOrderAsync(String orderId) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                Order order = getOrder(orderId);
                validateOrder(order);
                calculateTotal(order);
                updateInventory(order);
                
                return new OrderResult(orderId, "SUCCESS", order.getTotal());
            } catch (Exception e) {
                return new OrderResult(orderId, "FAILED", 0.0);
            }
        }, executorService);
    }
    
    private Order getOrder(String orderId) {
        return orderCache.computeIfAbsent(orderId, id -> {
            return repository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException(id));
        });
    }
    
    private void validateOrder(Order order) throws ValidationException {
        if (order.getItems() == null || order.getItems().isEmpty()) {
            throw new ValidationException("Order has no items");
        }
        
        for (OrderItem item : order.getItems()) {
            if (item.getQuantity() <= 0) {
                throw new ValidationException("Invalid quantity for item: " + item.getId());
            }
        }
    }
    
    private void calculateTotal(Order order) {
        double total = order.getItems().stream()
            .mapToDouble(item -> item.getPrice() * item.getQuantity())
            .sum();
        
        // 应用折扣
        if (order.getDiscountCode() != null) {
            total *= 0.9; // 10% 折扣
        }
        
        order.setTotal(total);
    }
    
    private void updateInventory(Order order) {
        for (OrderItem item : order.getItems()) {
            repository.decrementStock(item.getId(), item.getQuantity());
        }
    }
    
    public void shutdown() {
        executorService.shutdown();
        try {
            if (!executorService.awaitTermination(60, TimeUnit.SECONDS)) {
                executorService.shutdownNow();
            }
        } catch (InterruptedException e) {
            executorService.shutdownNow();
        }
    }
}

class OrderResult {
    private final String orderId;
    private final String status;
    private final double total;
    
    public OrderResult(String orderId, String status, double total) {
        this.orderId = orderId;
        this.status = status;
        this.total = total;
    }
    
    // Getters omitted for brevity
}`,
  },

  react: {
    name: 'React',
    icon: '⚛️',
    code: `import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';

const API_BASE = 'https://api.example.com';

// 自定义 Hook
function useProducts(filters) {
  return useQuery(
    ['products', filters],
    async () => {
      const { data } = await axios.get(\`\${API_BASE}/products\`, {
        params: filters
      });
      return data;
    },
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000
    }
  );
}

function ProductDashboard() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: [0, 1000],
    sortBy: 'name'
  });
  
  const { data: products, isLoading, error } = useProducts(filters);
  
  const createProductMutation = useMutation(
    async (newProduct) => {
      const { data } = await axios.post(\`\${API_BASE}/products\`, newProduct);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['products']);
      }
    }
  );
  
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    return products
      .filter(p => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1])
      .sort((a, b) => {
        if (filters.sortBy === 'price') {
          return a.price - b.price;
        }
        return a.name.localeCompare(b.name);
      });
  }, [products, filters]);
  
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);
  
  const handleCreateProduct = useCallback(async (formData) => {
    try {
      await createProductMutation.mutateAsync(formData);
      alert('Product created successfully!');
    } catch (error) {
      alert('Failed to create product');
    }
  }, [createProductMutation]);
  
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading products...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-container">
        <h2>Error loading products</h2>
        <p>{error.message}</p>
      </div>
    );
  }
  
  return (
    <div className="product-dashboard">
      <header className="dashboard-header">
        <h1>Product Management</h1>
        <ProductFilters filters={filters} onChange={handleFilterChange} />
      </header>
      
      <div className="product-grid">
        {filteredProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onUpdate={() => queryClient.invalidateQueries(['products'])}
          />
        ))}
      </div>
      
      <CreateProductForm onSubmit={handleCreateProduct} />
    </div>
  );
}

const ProductCard = React.memo(({ product, onUpdate }) => {
  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p className="price">\${product.price.toFixed(2)}</p>
      <button onClick={onUpdate}>Refresh</button>
    </div>
  );
});

export default ProductDashboard;`,
  },

  custom: {
    name: '自定义',
    icon: '📝',
    code: '',
  },
};
